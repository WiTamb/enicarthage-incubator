package com.enicarthage.incubator.service;

import com.enicarthage.incubator.dto.request.EvaluationRequest;
import com.enicarthage.incubator.dto.request.SelectionOverrideRequest;
import com.enicarthage.incubator.dto.response.ApplicationResponse;
import com.enicarthage.incubator.dto.response.EvaluationResponse;
import com.enicarthage.incubator.dto.response.RoundResultResponse;
import com.enicarthage.incubator.dto.response.UserResponse;
import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.*;
import com.enicarthage.incubator.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final SessionQuestionRepository questionRepository;
    private final QuestionnaireAnswerRepository answerRepository;
    private final RoundRepository roundRepository;
    private final RoundSelectionOverrideRepository overrideRepository;
    private final EmailService emailService;

    // ─── Read ─────────────────────────────────────────────────────────────────

    public List<ApplicationResponse> getMyApplications() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return applicationRepository.findByCandidateId(user.getId()).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ApplicationResponse> getSessionApplications(Long sessionId, Long roundId) {
        List<Application> apps = applicationRepository.findBySessionId(sessionId);

        if (roundId != null) {
            Session session = sessionRepository.findById(sessionId).orElse(null);
            boolean isRound1 = session != null && session.getRounds().stream()
                    .anyMatch(r -> r.getId().equals(roundId) && r.getOrderIndex() <= 1);
            final boolean includeNullRound = isRound1;

            apps = apps.stream().filter(app -> {
                if (app.getCurrentRound() != null && app.getCurrentRound().getId().equals(roundId)) return true;
                return includeNullRound && app.getCurrentRound() == null;
            }).collect(Collectors.toList());
        }
        return apps.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ─── Apply ────────────────────────────────────────────────────────────────

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
                .session(session).candidate(candidate).status(ApplicationStatus.PENDING).build();
        return mapToResponse(applicationRepository.save(application));
    }

    // ─── Manual advance / reject ──────────────────────────────────────────────

    @Transactional
    public ApplicationResponse acceptToRound1(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvée"));
        Round round1 = app.getSession().getRounds().stream()
                .filter(r -> r.getOrderIndex() == 1).findFirst()
                .orElseThrow(() -> new IllegalStateException("Round 1 non défini"));
        app.setCurrentRound(round1);
        app.setStatus(ApplicationStatus.ACCEPTED_ROUND_1);
        return mapToResponse(applicationRepository.save(app));
    }

    @Transactional
    public ApplicationResponse advanceApplication(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvée"));
        if (app.getCurrentRound() == null) throw new IllegalStateException("Le candidat n'est pas dans un round");
        int nextIndex = app.getCurrentRound().getOrderIndex() + 1;
        Round nextRound = app.getSession().getRounds().stream()
                .filter(r -> r.getOrderIndex() == nextIndex).findFirst()
                .orElseThrow(() -> new IllegalStateException("Pas de round suivant"));
        app.setCurrentRound(nextRound);
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
            switch (app.getCurrentRound().getOrderIndex()) {
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

    // ─── Evaluation ───────────────────────────────────────────────────────────

    @Transactional
    public ApplicationResponse evaluateApplication(Long id, EvaluationRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable"));

        String evaluatorEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User evaluator = userRepository.findByEmail(evaluatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluateur introuvable"));

        Project project = projectRepository.findByOwnerId(application.getCandidate().getId()).stream()
                .filter(p -> (application.getCurrentRound() == null && p.getRound() == null) ||
                        (p.getRound() != null && application.getCurrentRound() != null &&
                                p.getRound().getId().equals(application.getCurrentRound().getId())))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Aucun projet soumis pour ce round."));

        // Enforce questionnaire completion
        if (application.getCurrentRound() != null) {
            List<SessionQuestion> requiredQs = questionRepository
                    .findByRoundIdOrderByOrderIndexAsc(application.getCurrentRound().getId())
                    .stream().filter(SessionQuestion::isRequired).toList();
            List<QuestionnaireAnswer> provided = answerRepository.findByApplicationId(application.getId());
            for (SessionQuestion rq : requiredQs) {
                boolean answered = provided.stream().anyMatch(
                        a -> a.getQuestion().getId().equals(rq.getId()) && a.getAnswer() != null && !a.getAnswer().isBlank());
                if (!answered) throw new IllegalStateException(
                        "Candidat n'a pas répondu à toutes les questions obligatoires du round.");
            }
        }

        Evaluation evaluation = Evaluation.builder()
                .project(project).evaluator(evaluator).round(application.getCurrentRound())
                .score(request.getScore()).comment(request.getComment()).recommendation(request.getRecommendation())
                .build();
        evaluationRepository.save(evaluation);
        evaluationRepository.flush();

        if (application.getCurrentRound() != null) {
            checkAndGenerateSelectionList(application.getCurrentRound(), application.getSession());
        }
        return mapToResponse(application);
    }

    // ─── Selection lifecycle ──────────────────────────────────────────────────

    /** Returns ranked selection list for a round. */
    public RoundResultResponse getSelectionList(Long roundId) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round non trouvé"));

        List<Application> roundApps = applicationRepository.findBySessionId(round.getSession().getId()).stream()
                .filter(a -> a.getCurrentRound() != null && a.getCurrentRound().getId().equals(roundId))
                .collect(Collectors.toList());

        UserResponse jpDto = round.getJuryPresident() != null ? toUserResponse(round.getJuryPresident()) : null;

        return RoundResultResponse.builder()
                .roundId(round.getId())
                .roundName(round.getName())
                .passingCandidatesCount(round.getPassingCandidatesCount() != null ? round.getPassingCandidatesCount() : 0)
                .selectionValidated(round.isSelectionValidated())
                .selectionFinalized(round.isSelectionFinalized())
                .juryPresident(jpDto)
                .rankedCandidates(buildRankedList(round, roundApps))
                .build();
    }

    /** Admin overrides individual entries — each change requires a justification. */
    @Transactional
    public RoundResultResponse overrideSelection(Long roundId, SelectionOverrideRequest request) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round non trouvé"));

        if (round.isSelectionFinalized())
            throw new IllegalStateException("Liste finalisée — aucune modification possible.");

        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        for (SelectionOverrideRequest.CandidateDecision d : request.getDecisions()) {
            if (d.getJustification() == null || d.getJustification().isBlank())
                throw new IllegalStateException("Une justification est obligatoire pour chaque modification.");

            Application app = applicationRepository.findById(d.getApplicationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvée : " + d.getApplicationId()));

            RoundSelectionOverride ov = overrideRepository
                    .findByRoundIdAndApplicationId(roundId, app.getId())
                    .orElse(RoundSelectionOverride.builder().round(round).application(app).build());

            ov.setAccepted(d.isAccepted());
            ov.setJustification(d.getJustification());
            ov.setModifiedBy(admin);
            ov.setModifiedAt(LocalDateTime.now());
            overrideRepository.save(ov);
        }

        round.setSelectionValidated(true);
        roundRepository.save(round);
        return getSelectionList(roundId);
    }

    /**
     * Jury President (or Admin) finalizes the list:
     * advances/eliminates candidates and sends emails.
     */
    @Transactional
    public RoundResultResponse finalizeSelection(Long roundId) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round non trouvé"));

        if (round.isSelectionFinalized())
            throw new IllegalStateException("La liste est déjà finalisée.");

        String callerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        boolean isAdmin = caller.getRole() == Role.ADMIN;
        boolean isJP = round.getJuryPresident() != null &&
                round.getJuryPresident().getId().equals(caller.getId());
        if (!isAdmin && !isJP)
            throw new IllegalStateException("Seul l'administrateur ou le président du jury peut finaliser.");

        List<Application> roundApps = applicationRepository.findBySessionId(round.getSession().getId()).stream()
                .filter(a -> a.getCurrentRound() != null && a.getCurrentRound().getId().equals(roundId))
                .collect(Collectors.toList());

        List<RoundResultResponse.CandidateRankEntry> ranked = buildRankedList(round, roundApps);

        Session session = round.getSession();
        int nextIdx = round.getOrderIndex() + 1;
        Round nextRound = session.getRounds().stream()
                .filter(r -> r.getOrderIndex() == nextIdx).findFirst().orElse(null);
        String nextRoundName = nextRound != null ? nextRound.getName() : "Fin du programme";

        for (RoundResultResponse.CandidateRankEntry entry : ranked) {
            Application app = applicationRepository.findById(entry.getApplicationId()).orElseThrow();
            double score = entry.getAverageScore() != null ? entry.getAverageScore() : 0.0;
            String name = app.getCandidate().getFirstName() + " " + app.getCandidate().getLastName();
            String email = app.getCandidate().getEmail();

            if (entry.isFinalAccepted()) {
                if (nextRound != null) {
                    app.setCurrentRound(nextRound);
                    switch (nextIdx) {
                        case 2 -> app.setStatus(ApplicationStatus.ACCEPTED_ROUND_2);
                        case 3 -> app.setStatus(ApplicationStatus.ACCEPTED_ROUND_3);
                        case 4 -> app.setStatus(ApplicationStatus.ACCEPTED_ROUND_4);
                        case 5 -> app.setStatus(ApplicationStatus.ACCEPTED_ROUND_5);
                        default -> app.setStatus(ApplicationStatus.COMPLETED);
                    }
                } else {
                    app.setStatus(ApplicationStatus.COMPLETED);
                }
                applicationRepository.save(app);
                emailService.sendAcceptanceEmail(email, name, round.getName(), score, nextRoundName);
            } else {
                switch (round.getOrderIndex()) {
                    case 1 -> app.setStatus(ApplicationStatus.ELIMINATED_ROUND_1);
                    case 2 -> app.setStatus(ApplicationStatus.ELIMINATED_ROUND_2);
                    case 3 -> app.setStatus(ApplicationStatus.ELIMINATED_ROUND_3);
                    case 4 -> app.setStatus(ApplicationStatus.ELIMINATED_ROUND_4);
                    case 5 -> app.setStatus(ApplicationStatus.ELIMINATED_ROUND_5);
                }
                app.setCurrentRound(null);
                applicationRepository.save(app);
                emailService.sendRejectionEmail(email, name, round.getName(), score);
            }
        }

        if (nextRound != null) {
            nextRound.setStatus(RoundStatus.ACTIVE);
            roundRepository.save(nextRound);
        }

        round.setStatus(RoundStatus.COMPLETED);
        round.setSelectionFinalized(true);
        roundRepository.save(round);
        return getSelectionList(roundId);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private void checkAndGenerateSelectionList(Round round, Session session) {
        if (round.getStatus() == RoundStatus.COMPLETED) return;
        int required = round.getEvaluators().size();
        if (required == 0) return;

        List<Application> roundApps = applicationRepository.findBySessionId(session.getId()).stream()
                .filter(a -> a.getCurrentRound() != null && a.getCurrentRound().getId().equals(round.getId()))
                .collect(Collectors.toList());
        if (roundApps.isEmpty()) return;

        boolean allDone = roundApps.stream().allMatch(app -> {
            Project p = projectRepository.findByOwnerId(app.getCandidate().getId()).stream()
                    .filter(pr -> pr.getRound() != null && pr.getRound().getId().equals(round.getId()))
                    .findFirst().orElse(null);
            if (p == null) return false;
            return evaluationRepository.findByProjectId(p.getId()).stream()
                    .filter(e -> e.getRound() != null && e.getRound().getId().equals(round.getId()))
                    .count() >= required;
        });

        if (allDone) {
            // Notify admin(s)
            userRepository.findByRole(Role.ADMIN).forEach(admin ->
                    emailService.sendSelectionReadyEmail(
                            admin.getEmail(),
                            admin.getFirstName() + " " + admin.getLastName(),
                            round.getName(), session.getName()));
            // Notify jury president
            if (round.getJuryPresident() != null) {
                User jp = round.getJuryPresident();
                emailService.sendSelectionReadyEmail(
                        jp.getEmail(),
                        jp.getFirstName() + " " + jp.getLastName(),
                        round.getName(), session.getName());
            }
        }
    }

    private List<RoundResultResponse.CandidateRankEntry> buildRankedList(Round round, List<Application> roundApps) {
        List<RoundSelectionOverride> overrides = overrideRepository.findByRoundId(round.getId());
        int passingCount = round.getPassingCandidatesCount() != null && round.getPassingCandidatesCount() > 0
                ? round.getPassingCandidatesCount() : roundApps.size();

        record AS(Application app, double score) {}
        List<AS> scores = roundApps.stream().map(app -> {
            Project p = projectRepository.findByOwnerId(app.getCandidate().getId()).stream()
                    .filter(pr -> pr.getRound() != null && pr.getRound().getId().equals(round.getId()))
                    .findFirst().orElse(null);
            double avg = 0.0;
            if (p != null) {
                List<Evaluation> evals = evaluationRepository.findByProjectId(p.getId()).stream()
                        .filter(e -> e.getRound() != null && e.getRound().getId().equals(round.getId()))
                        .collect(Collectors.toList());
                if (!evals.isEmpty()) avg = evals.stream().mapToDouble(Evaluation::getScore).average().orElse(0.0);
            }
            return new AS(app, avg);
        }).sorted((a, b) -> Double.compare(b.score(), a.score())).collect(Collectors.toList());

        List<RoundResultResponse.CandidateRankEntry> result = new ArrayList<>();
        for (int i = 0; i < scores.size(); i++) {
            AS as = scores.get(i);
            boolean autoAccepted = i < passingCount;
            final Long appId = as.app().getId();
            RoundSelectionOverride ov = overrides.stream()
                    .filter(o -> o.getApplication().getId().equals(appId)).findFirst().orElse(null);
            boolean finalAccepted = ov != null ? ov.isAccepted() : autoAccepted;

            result.add(RoundResultResponse.CandidateRankEntry.builder()
                    .applicationId(appId)
                    .candidateId(as.app().getCandidate().getId())
                    .candidateName(as.app().getCandidate().getFirstName() + " " + as.app().getCandidate().getLastName())
                    .candidateEmail(as.app().getCandidate().getEmail())
                    .averageScore(Math.round(as.score() * 10.0) / 10.0)
                    .rank(i + 1)
                    .autoAccepted(autoAccepted)
                    .finalAccepted(finalAccepted)
                    .overrideJustification(ov != null ? ov.getJustification() : null)
                    .overriddenBy(ov != null ? ov.getModifiedBy().getFirstName() + " " + ov.getModifiedBy().getLastName() : null)
                    .overriddenAt(ov != null ? ov.getModifiedAt() : null)
                    .build());
        }
        return result;
    }

    public ApplicationResponse mapToResponse(Application app) {
        List<EvaluationResponse> history = new ArrayList<>();
        projectRepository.findByOwnerId(app.getCandidate().getId()).forEach(p -> {
            if (p.getRound() != null && p.getRound().getSession().getId().equals(app.getSession().getId())) {
                List<Evaluation> evals = evaluationRepository.findByProjectId(p.getId());
                if (evals != null && !evals.isEmpty()) {
                    history.addAll(evals.stream().map(this::mapEvaluationToResponse).collect(Collectors.toList()));
                }
            }
        });

        Double averageScore = null;
        if (app.getCurrentRound() != null) {
            for (Project p : projectRepository.findByOwnerId(app.getCandidate().getId())) {
                if (p.getRound() != null && p.getRound().getId().equals(app.getCurrentRound().getId())) {
                    List<Evaluation> evals = evaluationRepository.findByProjectId(p.getId()).stream()
                            .filter(e -> e.getRound() != null && e.getRound().getId().equals(app.getCurrentRound().getId()))
                            .collect(Collectors.toList());
                    if (!evals.isEmpty()) {
                        averageScore = Math.round(evals.stream().mapToDouble(Evaluation::getScore).average().orElse(0.0) * 10.0) / 10.0;
                    }
                    break;
                }
            }
        }

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
                .averageScore(averageScore)
                .evaluationHistory(history)
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }

    private EvaluationResponse mapEvaluationToResponse(Evaluation e) {
        return EvaluationResponse.builder()
                .id(e.getId()).score(e.getScore()).comment(e.getComment())
                .recommendation(e.getRecommendation()).evaluatedAt(e.getEvaluatedAt())
                .evaluatorName(e.getEvaluator().getFirstName() + " " + e.getEvaluator().getLastName())
                .roundName(e.getRound() != null ? e.getRound().getName() : "N/A")
                .build();
    }

    private UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .id(u.getId()).firstName(u.getFirstName()).lastName(u.getLastName())
                .email(u.getEmail()).role(u.getRole().name()).build();
    }
}
