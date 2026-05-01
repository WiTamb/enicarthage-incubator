package com.enicarthage.incubator.service;

import com.enicarthage.incubator.dto.request.EvaluationRequest;
import com.enicarthage.incubator.dto.response.ApplicationResponse;
import com.enicarthage.incubator.dto.response.EvaluationResponse;
import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.*;
import com.enicarthage.incubator.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final EvaluationRepository evaluationRepository;

    public List<ApplicationResponse> getMyApplications() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return applicationRepository.findByCandidateId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getSessionApplications(Long sessionId, Long roundId) {
        List<Application> apps = applicationRepository.findBySessionId(sessionId);
        
        if (roundId != null) {
            // Check if the requested round is Round 1 of this session
            Session session = sessionRepository.findById(sessionId).orElse(null);
            boolean isRound1 = false;
            if (session != null) {
                isRound1 = session.getRounds().stream()
                        .anyMatch(r -> r.getId().equals(roundId) && r.getOrderIndex() <= 1);
            }
            final boolean includeNullRound = isRound1;
            
            apps = apps.stream()
                    .filter(app -> {
                        if (app.getCurrentRound() != null && app.getCurrentRound().getId().equals(roundId)) return true;
                        // For Round 1, also include PENDING candidates (no round assigned yet)
                        if (includeNullRound && app.getCurrentRound() == null) return true;
                        return false;
                    })
                    .collect(Collectors.toList());
        }
        
        return apps.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse applyToSession(Long sessionId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User candidate = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session non trouvée"));

        if (applicationRepository.findBySessionIdAndCandidateId(sessionId, candidate.getId()).isPresent()) {
            throw new IllegalStateException("Vous avez déjà postulé à cette session");
        }

        Application application = Application.builder()
                .session(session)
                .candidate(candidate)
                .status(ApplicationStatus.PENDING)
                .build();

        return mapToResponse(applicationRepository.save(application));
    }

    @Transactional
    public ApplicationResponse acceptToRound1(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvée"));
        
        Round round1 = app.getSession().getRounds().stream()
                .filter(r -> r.getOrderIndex() == 1)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Le Round 1 n'est pas encore défini pour cette session"));

        app.setCurrentRound(round1);
        app.setStatus(ApplicationStatus.ACCEPTED_ROUND_1);
        return mapToResponse(applicationRepository.save(app));
    }

    @Transactional
    public ApplicationResponse advanceApplication(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvée"));
        
        if (app.getCurrentRound() == null) {
            throw new IllegalStateException("Le candidat n'est pas encore dans un round");
        }

        int nextIndex = app.getCurrentRound().getOrderIndex() + 1;
        Round nextRound = app.getSession().getRounds().stream()
                .filter(r -> r.getOrderIndex() == nextIndex)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Il n'y a pas de round suivant défini"));

        app.setCurrentRound(nextRound);
        
        // Update status based on round index
        switch (nextIndex) {
            case 2 -> app.setStatus(ApplicationStatus.ACCEPTED_ROUND_2);
            case 3 -> app.setStatus(ApplicationStatus.ACCEPTED_ROUND_3);
            case 4 -> app.setStatus(ApplicationStatus.ACCEPTED_ROUND_4);
            case 5 -> app.setStatus(ApplicationStatus.ACCEPTED_ROUND_5);
            default -> app.setStatus(ApplicationStatus.COMPLETED);
        }

        return mapToResponse(applicationRepository.save(app));
    }

    @Transactional
    public ApplicationResponse rejectApplication(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvée"));
        app.setStatus(ApplicationStatus.REJECTED);
        app.setCurrentRound(null);
        return mapToResponse(applicationRepository.save(app));
    }

    @Transactional
    public ApplicationResponse eliminateApplication(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvée"));
        
        if (app.getCurrentRound() != null) {
            int currentIdx = app.getCurrentRound().getOrderIndex();
            switch (currentIdx) {
                case 1 -> app.setStatus(ApplicationStatus.ELIMINATED_ROUND_1);
                case 2 -> app.setStatus(ApplicationStatus.ELIMINATED_ROUND_2);
                case 3 -> app.setStatus(ApplicationStatus.ELIMINATED_ROUND_3);
                case 4 -> app.setStatus(ApplicationStatus.ELIMINATED_ROUND_4);
                case 5 -> app.setStatus(ApplicationStatus.ELIMINATED_ROUND_5);
            }
        } else {
            app.setStatus(ApplicationStatus.REJECTED);
        }
        
        return mapToResponse(applicationRepository.save(app));
    }

    public ApplicationResponse mapToResponse(Application app) {
        // Fetch evaluations for the candidate's projects related to this session/rounds
        List<EvaluationResponse> history = new ArrayList<>();
        projectRepository.findByOwnerId(app.getCandidate().getId()).forEach(p -> {
            if (p.getEvaluations() != null) {
                history.addAll(p.getEvaluations().stream()
                    .map(this::mapEvaluationToResponse)
                    .collect(Collectors.toList()));
            }
        });

        return ApplicationResponse.builder()
                .id(app.getId())
                .sessionId(app.getSession().getId())
                .sessionName(app.getSession().getName())
                .candidateId(app.getCandidate().getId())
                .candidateName(app.getCandidate().getFirstName() + " " + app.getCandidate().getLastName())
                .candidateEmail(app.getCandidate().getEmail())
                .currentRoundId(app.getCurrentRound() != null ? app.getCurrentRound().getId() : null)
                .currentRoundName(app.getCurrentRound() != null ? app.getCurrentRound().getName() : "Aucun")
                .currentRoundIndex(app.getCurrentRound() != null ? app.getCurrentRound().getOrderIndex() : 0)
                .status(app.getStatus())
                .evaluationHistory(history)
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }

    private EvaluationResponse mapEvaluationToResponse(Evaluation e) {
        return EvaluationResponse.builder()
                .id(e.getId())
                .score(e.getScore())
                .comment(e.getComment())
                .recommendation(e.getRecommendation())
                .evaluatedAt(e.getEvaluatedAt())
                .evaluatorName(e.getEvaluator().getFirstName() + " " + e.getEvaluator().getLastName())
                .roundName(e.getRound() != null ? e.getRound().getName() : "N/A")
                .build();
    }

    @Transactional
    public ApplicationResponse evaluateApplication(Long id, EvaluationRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable"));

        String evaluatorEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User evaluator = userRepository.findByEmail(evaluatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluateur introuvable"));

        // Find the project for this round
        Project project = projectRepository.findByOwnerId(application.getCandidate().getId()).stream()
                .filter(p -> (application.getCurrentRound() == null && p.getRound() == null) || 
                            (p.getRound() != null && application.getCurrentRound() != null && p.getRound().getId().equals(application.getCurrentRound().getId())))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Aucun projet soumis pour ce round par ce candidat."));

        Evaluation evaluation = Evaluation.builder()
                .project(project)
                .evaluator(evaluator)
                .round(application.getCurrentRound())
                .score(request.getScore())
                .comment(request.getComment())
                .recommendation(request.getRecommendation())
                .build();

        evaluationRepository.save(evaluation);
        
        return mapToResponse(application);
    }
}
