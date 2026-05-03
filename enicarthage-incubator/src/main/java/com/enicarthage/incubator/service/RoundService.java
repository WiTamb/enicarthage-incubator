package com.enicarthage.incubator.service;

import com.enicarthage.incubator.dto.request.RoundRequest;
import com.enicarthage.incubator.dto.response.RoundResponse;
import com.enicarthage.incubator.dto.response.UserResponse;
import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.Round;
import com.enicarthage.incubator.model.Session;
import com.enicarthage.incubator.model.User;
import com.enicarthage.incubator.repository.RoundRepository;
import com.enicarthage.incubator.repository.SessionRepository;
import com.enicarthage.incubator.repository.UserRepository;
import com.enicarthage.incubator.service.QuestionnaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoundService {
    private final RoundRepository roundRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final QuestionnaireService questionnaireService;

    public List<RoundResponse> getRoundsBySession(Long sessionId) {
        return roundRepository.findBySessionIdOrderByOrderIndexAsc(sessionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoundResponse createRound(Long sessionId, RoundRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session non trouvée"));
        
        Set<User> evaluators = new HashSet<>();
        if (request.getEvaluatorIds() != null) {
            for (Long id : request.getEvaluatorIds()) {
                userRepository.findById(id).ifPresent(evaluators::add);
            }
        }

        User juryPresident = null;
        if (request.getJuryPresidentId() != null) {
            juryPresident = userRepository.findById(request.getJuryPresidentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Président du jury non trouvé"));
        }

        Round round = Round.builder()
                .session(session)
                .name(request.getName())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex())
                .roundNumber(request.getOrderIndex())
                .passingCandidatesCount(request.getPassingCandidatesCount() != null ? request.getPassingCandidatesCount() : 0)
                .status(request.getStatus())
                .evaluators(evaluators)
                .juryPresident(juryPresident)
                .build();
        
        Round savedRound = roundRepository.save(round);

        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            questionnaireService.saveQuestionnaire(savedRound.getId(), request.getQuestions());
        }

        return mapToResponse(savedRound);
    }

    @Transactional
    public RoundResponse updateRound(Long sessionId, Long roundId, RoundRequest request) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round non trouvé"));
        
        if (!round.getSession().getId().equals(sessionId)) {
            throw new IllegalArgumentException("Le round n'appartient pas à cette session");
        }
        
        round.setName(request.getName());
        round.setDescription(request.getDescription());
        round.setOrderIndex(request.getOrderIndex());
        round.setStatus(request.getStatus());

        System.out.println("Updating Round " + roundId + " with " + (request.getEvaluatorIds() != null ? request.getEvaluatorIds().size() : 0) + " evaluators");
        
        if (request.getEvaluatorIds() != null) {
            Set<User> evaluators = new HashSet<>();
            for (Long id : request.getEvaluatorIds()) {
                userRepository.findById(id).ifPresent(evaluators::add);
            }
            round.setEvaluators(evaluators);
        }

        if (request.getJuryPresidentId() != null) {
            userRepository.findById(request.getJuryPresidentId()).ifPresent(round::setJuryPresident);
        }

        if (request.getPassingCandidatesCount() != null) {
            round.setPassingCandidatesCount(request.getPassingCandidatesCount());
        }
        
        // Sync order index and round number for UI
        if (request.getOrderIndex() > 0) {
            round.setOrderIndex(request.getOrderIndex());
            round.setRoundNumber(request.getOrderIndex());
        }
        
        Round saved = roundRepository.saveAndFlush(round);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteRound(Long sessionId, Long roundId) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round non trouvé"));
        
        if (!round.getSession().getId().equals(sessionId)) {
            throw new IllegalArgumentException("Le round n'appartient pas à cette session");
        }
        
        roundRepository.delete(round);
    }

    public RoundResponse mapToResponse(Round round) {
        return RoundResponse.builder()
                .id(round.getId())
                .sessionId(round.getSession() != null ? round.getSession().getId() : null)
                .name(round.getName())
                .description(round.getDescription())
                .orderIndex(round.getOrderIndex())
                .status(round.getStatus())
                .passingCandidatesCount(round.getPassingCandidatesCount())
                .selectionValidated(round.isSelectionValidated())
                .selectionFinalized(round.isSelectionFinalized())
                .questionCount(round.getQuestions() != null ? round.getQuestions().size() : 0)
                .juryPresident(round.getJuryPresident() != null ? mapUserToResponse(round.getJuryPresident()) : null)
                .evaluators(round.getEvaluators().stream()
                        .map(this::mapUserToResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private UserResponse mapUserToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
