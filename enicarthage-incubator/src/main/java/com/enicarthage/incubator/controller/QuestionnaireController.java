package com.enicarthage.incubator.controller;

import com.enicarthage.incubator.dto.request.QuestionnaireSubmitRequest;
import com.enicarthage.incubator.dto.request.SessionQuestionRequest;
import com.enicarthage.incubator.dto.response.ApiResponse;
import com.enicarthage.incubator.dto.response.SessionQuestionResponse;
import com.enicarthage.incubator.service.QuestionnaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions/{sessionId}/questionnaire")
@RequiredArgsConstructor
public class QuestionnaireController {

    private final QuestionnaireService questionnaireService;

    /** GET questionnaire for a session (public: any authenticated user) */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SessionQuestionResponse>>> getQuestionnaire(
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Questionnaire récupéré",
                questionnaireService.getQuestionnaire(sessionId)));
    }

    /** Admin: replace the full questionnaire for a session */
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SessionQuestionResponse>>> saveQuestionnaire(
            @PathVariable Long sessionId,
            @RequestBody List<SessionQuestionRequest> questions) {
        return ResponseEntity.ok(ApiResponse.success(
                "Questionnaire sauvegardé",
                questionnaireService.saveQuestionnaire(sessionId, questions)));
    }

    /** Candidate: submit their answers */
    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> submitAnswers(
            @PathVariable Long sessionId,
            @RequestBody QuestionnaireSubmitRequest request) {
        questionnaireService.submitAnswers(sessionId, request);
        return ResponseEntity.ok(ApiResponse.success("Réponses enregistrées", null));
    }

    /** Candidate: check whether they already submitted answers */
    @GetMapping("/has-answered")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Boolean>> hasAnswered(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.success("Statut", questionnaireService.hasAnswered(sessionId)));
    }

    /** Admin/Evaluator: GET answers for a specific application */
    @GetMapping("/applications/{applicationId}/answers")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<List<com.enicarthage.incubator.dto.response.QuestionnaireAnswerResponse>>> getAnswers(
            @PathVariable Long sessionId,
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Réponses récupérées",
                questionnaireService.getAnswersForApplication(applicationId)));
    }
}
