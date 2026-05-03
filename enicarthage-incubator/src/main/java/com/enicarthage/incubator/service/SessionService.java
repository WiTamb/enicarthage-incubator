package com.enicarthage.incubator.service;

import com.enicarthage.incubator.dto.request.SessionRequest;
import com.enicarthage.incubator.dto.response.RoundResponse;
import com.enicarthage.incubator.dto.response.SessionResponse;
import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.Session;
import com.enicarthage.incubator.repository.ApplicationRepository;
import com.enicarthage.incubator.repository.RoundRepository;
import com.enicarthage.incubator.repository.SessionRepository;
import com.enicarthage.incubator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {
    private final SessionRepository sessionRepository;
    private final ApplicationRepository applicationRepository;
    private final RoundRepository roundRepository;
    private final UserRepository userRepository;
    private final QuestionnaireService questionnaireService;

    public List<SessionResponse> getAllSessions() {
        return sessionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SessionResponse> getSessionsForEvaluator(String email) {
        System.out.println("Fetching sessions for evaluator: " + email);
        List<Session> sessions = sessionRepository.findByEvaluatorEmail(email);
        System.out.println("Found " + sessions.size() + " sessions for " + email);
        return sessions.stream()
                .map(s -> mapToResponseFiltered(s, email))
                .collect(Collectors.toList());
    }

    public SessionResponse getSessionById(Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session non trouvée"));
        return mapToResponse(session);
    }

    public SessionResponse getSessionByIdForEvaluator(Long id, String email) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session non trouvée"));
        
        // Ensure evaluator is actually in this session
        boolean isAssigned = session.getRounds().stream()
                .anyMatch(r -> r.getEvaluators().stream().anyMatch(e -> e.getEmail().equals(email)));
        
        if (!isAssigned) {
            throw new ResourceNotFoundException("Vous n'êtes pas assigné à cette session");
        }

        return mapToResponseFiltered(session, email);
    }

    @Transactional
    public SessionResponse createSession(SessionRequest request) {
        Session session = Session.builder()
                .name(request.getName())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus())
                .build();
        
        Session saved = sessionRepository.save(session);
        
        if (request.getRounds() != null) {
            for (com.enicarthage.incubator.dto.request.RoundRequest rr : request.getRounds()) {
                saveRound(saved, rr);
            }
        }
        
        return mapToResponse(saved);
    }

    @Transactional
    public SessionResponse updateSession(Long id, SessionRequest request) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session non trouvée"));
        
        if (session.getStatus() == com.enicarthage.incubator.model.SessionStatus.CLOSED) {
            throw new IllegalStateException("Une session fermée ne peut plus être modifiée.");
        }
        
        session.setName(request.getName());
        session.setDescription(request.getDescription());
        session.setStartDate(request.getStartDate());
        session.setEndDate(request.getEndDate());
        session.setStatus(request.getStatus());
        
        Session saved = sessionRepository.save(session);

        // Smart sync: update existing rounds, add new ones, and safely delete removed ones
        if (request.getRounds() != null) {
            List<com.enicarthage.incubator.model.Round> existingRounds = new java.util.ArrayList<>(saved.getRounds());
            
            for (com.enicarthage.incubator.dto.request.RoundRequest rr : request.getRounds()) {
                // Match by orderIndex or name
                com.enicarthage.incubator.model.Round existing = existingRounds.stream()
                        .filter(r -> r.getOrderIndex() == rr.getOrderIndex() || r.getName().equals(rr.getName()))
                        .findFirst()
                        .orElse(null);
                
                if (existing != null) {
                    existing.setName(rr.getName());
                    existing.setDescription(rr.getDescription());
                    existing.setOrderIndex(rr.getOrderIndex());
                    existing.setRoundNumber(rr.getOrderIndex());
                    existing.setPassingCandidatesCount(rr.getPassingCandidatesCount() != null ? rr.getPassingCandidatesCount() : 0);
                    existing.setStatus(rr.getStatus());

                    java.util.Set<com.enicarthage.incubator.model.User> evaluators = new java.util.HashSet<>();
                    if (rr.getEvaluatorIds() != null) {
                        for (Long eid : rr.getEvaluatorIds()) {
                            userRepository.findById(eid).ifPresent(evaluators::add);
                        }
                    }
                    existing.setEvaluators(evaluators);

                    if (rr.getJuryPresidentId() != null) {
                        userRepository.findById(rr.getJuryPresidentId()).ifPresent(existing::setJuryPresident);
                    }

                    roundRepository.save(existing);
                    
                    if (rr.getQuestions() != null && !rr.getQuestions().isEmpty()) {
                        questionnaireService.saveQuestionnaire(existing.getId(), rr.getQuestions());
                    }
                    
                    existingRounds.remove(existing);
                } else {
                    saveRound(saved, rr);
                }
            }
            
            // For any rounds left that are no longer in the request
            for (com.enicarthage.incubator.model.Round toDelete : existingRounds) {
                if (applicationRepository.countByCurrentRoundId(toDelete.getId()) > 0) {
                    throw new IllegalStateException("Impossible de supprimer le round '" + toDelete.getName() + "' car des candidatures y sont actuellement affectées.");
                }
                roundRepository.delete(toDelete);
                saved.getRounds().remove(toDelete);
            }
        }
        
        return mapToResponse(saved);
    }

    private void saveRound(Session session, com.enicarthage.incubator.dto.request.RoundRequest rr) {
        java.util.Set<com.enicarthage.incubator.model.User> evaluators = new java.util.HashSet<>();
        if (rr.getEvaluatorIds() != null) {
            for (Long eid : rr.getEvaluatorIds()) {
                userRepository.findById(eid).ifPresent(evaluators::add);
            }
        }

        com.enicarthage.incubator.model.User juryPresident = null;
        if (rr.getJuryPresidentId() != null) {
            juryPresident = userRepository.findById(rr.getJuryPresidentId()).orElse(null);
        }

        com.enicarthage.incubator.model.Round round = com.enicarthage.incubator.model.Round.builder()
                .session(session)
                .name(rr.getName())
                .description(rr.getDescription())
                .orderIndex(rr.getOrderIndex())
                .roundNumber(rr.getOrderIndex())
                .passingCandidatesCount(rr.getPassingCandidatesCount() != null ? rr.getPassingCandidatesCount() : 0)
                .status(rr.getStatus())
                .evaluators(evaluators)
                .juryPresident(juryPresident)
                .build();
        com.enicarthage.incubator.model.Round savedRound = roundRepository.save(round);

        if (rr.getQuestions() != null && !rr.getQuestions().isEmpty()) {
            questionnaireService.saveQuestionnaire(savedRound.getId(), rr.getQuestions());
        }
    }

    @Transactional
    public void deleteSession(Long id) {
        if (!sessionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Session non trouvée");
        }
        sessionRepository.deleteById(id);
    }

    public SessionResponse mapToResponse(Session session) {
        return buildResponse(session, session.getRounds());
    }

    private SessionResponse mapToResponseFiltered(Session session, String evaluatorEmail) {
        // Filter rounds to only show those where the evaluator is assigned
        List<com.enicarthage.incubator.model.Round> filteredRounds = session.getRounds().stream()
                .filter(r -> r.getEvaluators().stream().anyMatch(e -> e.getEmail().equals(evaluatorEmail)))
                .collect(Collectors.toList());
        
        return buildResponse(session, filteredRounds);
    }

    private SessionResponse buildResponse(Session session, List<com.enicarthage.incubator.model.Round> rounds) {
        return SessionResponse.builder()
                .id(session.getId())
                .name(session.getName())
                .description(session.getDescription())
                .startDate(session.getStartDate())
                .endDate(session.getEndDate())
                .status(session.getStatus())
                .rounds(rounds.stream()
                        .map(r -> RoundResponse.builder()
                                .id(r.getId())
                                .sessionId(session.getId())
                                .name(r.getName())
                                .description(r.getDescription())
                                .orderIndex(r.getOrderIndex())
                                .passingCandidatesCount(r.getPassingCandidatesCount())
                                .status(r.getStatus())
                                .selectionValidated(r.isSelectionValidated())
                                .selectionFinalized(r.isSelectionFinalized())
                                .questionCount(r.getQuestions() != null ? r.getQuestions().size() : 0)
                                .questions(r.getQuestions() != null ? r.getQuestions().stream()
                                        .map(q -> com.enicarthage.incubator.dto.response.SessionQuestionResponse.builder()
                                                .id(q.getId())
                                                .roundId(r.getId())
                                                .label(q.getLabel())
                                                .type(q.getType())
                                                .options(q.getOptions())
                                                .required(q.isRequired())
                                                .orderIndex(q.getOrderIndex())
                                                .build())
                                        .collect(Collectors.toList()) : java.util.List.of())
                                .juryPresident(r.getJuryPresident() != null ?
                                        com.enicarthage.incubator.dto.response.UserResponse.builder()
                                                .id(r.getJuryPresident().getId())
                                                .firstName(r.getJuryPresident().getFirstName())
                                                .lastName(r.getJuryPresident().getLastName())
                                                .email(r.getJuryPresident().getEmail())
                                                .role(r.getJuryPresident().getRole().name())
                                                .build() : null)
                                .evaluators(r.getEvaluators().stream()
                                        .map(e -> com.enicarthage.incubator.dto.response.UserResponse.builder()
                                                .id(e.getId())
                                                .firstName(e.getFirstName())
                                                .lastName(e.getLastName())
                                                .email(e.getEmail())
                                                .role(e.getRole().name())
                                                .build())
                                        .collect(Collectors.toList()))
                                .build())
                        .collect(Collectors.toList()))
                .totalApplicants(applicationRepository.countBySessionId(session.getId()))
                .build();
    }
}
