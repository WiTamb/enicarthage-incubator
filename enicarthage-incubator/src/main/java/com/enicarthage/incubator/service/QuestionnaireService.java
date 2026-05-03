package com.enicarthage.incubator.service;

import com.enicarthage.incubator.dto.request.QuestionnaireSubmitRequest;
import com.enicarthage.incubator.dto.request.SessionQuestionRequest;
import com.enicarthage.incubator.dto.response.SessionQuestionResponse;
import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.*;
import com.enicarthage.incubator.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionnaireService {

    private final RoundRepository roundRepository;
    private final SessionQuestionRepository questionRepository;
    private final ApplicationRepository applicationRepository;
    private final QuestionnaireAnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    // ── ADMIN ──────────────────────────────────────────────────────────────

    public List<SessionQuestionResponse> getQuestionnaire(Long roundId) {
        return questionRepository.findByRoundIdOrderByOrderIndexAsc(roundId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<SessionQuestionResponse> saveQuestionnaire(Long roundId, List<SessionQuestionRequest> requests) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round non trouvé"));

        // Full replace: remove old questions and insert fresh ones
        questionRepository.deleteByRoundId(roundId);

        int idx = 0;
        for (SessionQuestionRequest req : requests) {
            SessionQuestion q = SessionQuestion.builder()
                    .round(round)
                    .label(req.getLabel())
                    .type(req.getType())
                    .options(req.getOptions())
                    .required(req.isRequired())
                    .orderIndex(idx++)
                    .build();
            questionRepository.save(q);
        }

        return getQuestionnaire(roundId);
    }

    // ── CANDIDATE ──────────────────────────────────────────────────────────

    @Transactional
    public void submitAnswers(Long roundId, QuestionnaireSubmitRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User candidate = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round non trouvé"));

        Application app = applicationRepository
                .findBySessionIdAndCandidateId(round.getSession().getId(), candidate.getId())
                .orElseGet(() -> {
                    if (round.getOrderIndex() != 1) {
                        throw new IllegalStateException("Vous n'êtes pas inscrit à cette session.");
                    }
                    return applicationRepository.save(Application.builder()
                            .session(round.getSession())
                            .candidate(candidate)
                            .status(ApplicationStatus.PENDING)
                            .build());
                });

        if (app.getCurrentRound() != null && !app.getCurrentRound().getId().equals(roundId)) {
            throw new IllegalStateException("Vous n'êtes pas autorisé à soumettre pour ce round actuellement.");
        }

        // Delete old answers for this application before saving new ones
        List<QuestionnaireAnswer> existing = answerRepository.findByApplicationId(app.getId());
        answerRepository.deleteAll(existing);

        if (request.getAnswers() != null) {
            request.getAnswers().forEach((questionId, answerText) -> {
                questionRepository.findById(questionId).ifPresent(question -> {
                    QuestionnaireAnswer answer = QuestionnaireAnswer.builder()
                            .application(app)
                            .question(question)
                            .answer(answerText)
                            .build();
                    answerRepository.save(answer);
                });
            });
        }
    }

    public boolean hasAnswered(Long roundId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User candidate = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Round round = roundRepository.findById(roundId).orElseThrow();

        return applicationRepository.findBySessionIdAndCandidateId(round.getSession().getId(), candidate.getId())
                .map(app -> {
                    // Check if there is any answer for THIS round's questions
                    List<QuestionnaireAnswer> answers = answerRepository.findByApplicationId(app.getId());
                    return answers.stream().anyMatch(a -> a.getQuestion().getRound().getId().equals(roundId));
                })
                .orElse(false);
    }

    public List<com.enicarthage.incubator.dto.response.QuestionnaireAnswerResponse> getAnswersForApplication(
            Long applicationId) {
        return answerRepository.findByApplicationId(applicationId).stream()
                .map(a -> com.enicarthage.incubator.dto.response.QuestionnaireAnswerResponse.builder()
                        .id(a.getId())
                        .applicationId(a.getApplication().getId())
                        .question(toResponse(a.getQuestion()))
                        .answer(a.getAnswer())
                        .build())
                .collect(Collectors.toList());
    }

    public List<com.enicarthage.incubator.dto.response.QuestionnaireAnswerResponse> getAnswersForProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet non trouvé"));
        if (project.getRound() == null || project.getRound().getSession() == null) return List.of();
        Application app = applicationRepository.findBySessionIdAndCandidateId(
                project.getRound().getSession().getId(), project.getOwner().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvée pour ce projet"));
        return getAnswersForApplication(app.getId());
    }

    // ── MAPPER ─────────────────────────────────────────────────────────────

    private SessionQuestionResponse toResponse(SessionQuestion q) {
        return SessionQuestionResponse.builder()
                .id(q.getId())
                .roundId(q.getRound().getId())
                .label(q.getLabel())
                .type(q.getType())
                .options(q.getOptions())
                .required(q.isRequired())
                .orderIndex(q.getOrderIndex())
                .build();
    }
}
