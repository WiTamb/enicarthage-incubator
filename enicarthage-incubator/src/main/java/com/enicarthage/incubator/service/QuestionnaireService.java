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

    private final SessionRepository sessionRepository;
    private final SessionQuestionRepository questionRepository;
    private final ApplicationRepository applicationRepository;
    private final QuestionnaireAnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    // ── ADMIN ──────────────────────────────────────────────────────────────

    public List<SessionQuestionResponse> getQuestionnaire(Long sessionId) {
        return questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<SessionQuestionResponse> saveQuestionnaire(Long sessionId, List<SessionQuestionRequest> requests) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session non trouvée"));

        // Full replace: remove old questions and insert fresh ones
        questionRepository.deleteBySessionId(sessionId);

        int idx = 0;
        for (SessionQuestionRequest req : requests) {
            SessionQuestion q = SessionQuestion.builder()
                    .session(session)
                    .label(req.getLabel())
                    .type(req.getType())
                    .options(req.getOptions())
                    .required(req.isRequired())
                    .orderIndex(idx++)
                    .build();
            questionRepository.save(q);
        }

        return getQuestionnaire(sessionId);
    }

    // ── CANDIDATE ──────────────────────────────────────────────────────────

    @Transactional
    public void submitAnswers(Long sessionId, QuestionnaireSubmitRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User candidate = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Application app = applicationRepository
                .findBySessionIdAndCandidateId(sessionId, candidate.getId())
                .orElseGet(() -> {
                    Session session = sessionRepository.findById(sessionId)
                            .orElseThrow(() -> new ResourceNotFoundException("Session non trouvée"));
                    Application newApp = Application.builder()
                            .session(session)
                            .candidate(candidate)
                            .status(ApplicationStatus.PENDING)
                            .build();
                    return applicationRepository.save(newApp);
                });

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

    public boolean hasAnswered(Long sessionId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User candidate = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        return applicationRepository.findBySessionIdAndCandidateId(sessionId, candidate.getId())
                .map(app -> !answerRepository.findByApplicationId(app.getId()).isEmpty())
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
                .sessionId(q.getSession().getId())
                .label(q.getLabel())
                .type(q.getType())
                .options(q.getOptions())
                .required(q.isRequired())
                .orderIndex(q.getOrderIndex())
                .build();
    }
}
