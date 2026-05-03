package com.enicarthage.incubator.controller;

import com.enicarthage.incubator.dto.request.EvaluationRequest;
import com.enicarthage.incubator.dto.response.ApiResponse;
import com.enicarthage.incubator.dto.response.ApplicationResponse;
import com.enicarthage.incubator.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;

    // Session-specific endpoints
    @PostMapping("/api/sessions/{sessionId}/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> applyToSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.success("Candidature soumise", applicationService.applyToSession(sessionId)));
    }

    @GetMapping("/api/sessions/{sessionId}/applications")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getSessionApplications(
            @PathVariable Long sessionId,
            @RequestParam(required = false) Long roundId) {
        return ResponseEntity.ok(ApiResponse.success("Candidatures récupérées", applicationService.getSessionApplications(sessionId, roundId)));
    }

    // General application endpoints
    @GetMapping("/api/applications/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications() {
        return ResponseEntity.ok(ApiResponse.success("Mes candidatures", applicationService.getMyApplications()));
    }

    @PutMapping("/api/applications/{id}/accept")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> acceptApplication(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Candidature acceptée au Round 1", applicationService.acceptToRound1(id)));
    }

    @PutMapping("/api/applications/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> rejectApplication(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Candidature rejetée", applicationService.rejectApplication(id)));
    }

    @PutMapping("/api/applications/{id}/advance")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> advanceApplication(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Candidat avancé au round suivant", applicationService.advanceApplication(id)));
    }

    @PutMapping("/api/applications/{id}/eliminate")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> eliminateApplication(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Candidat éliminé", applicationService.eliminateApplication(id)));
    }
    @PutMapping("/api/applications/{id}/evaluate")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> evaluateApplication(
            @PathVariable Long id,
            @Valid @RequestBody EvaluationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Évaluation enregistrée", applicationService.evaluateApplication(id, request)));
    }

    // ─── Selection lifecycle ───────────────────────────────────────────────────

    @GetMapping("/api/rounds/{roundId}/selection")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<com.enicarthage.incubator.dto.response.RoundResultResponse>> getSelectionList(
            @PathVariable Long roundId) {
        return ResponseEntity.ok(ApiResponse.success("Liste de sélection", applicationService.getSelectionList(roundId)));
    }

    @PutMapping("/api/rounds/{roundId}/selection/override")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<com.enicarthage.incubator.dto.response.RoundResultResponse>> overrideSelection(
            @PathVariable Long roundId,
            @RequestBody com.enicarthage.incubator.dto.request.SelectionOverrideRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Modifications enregistrées", applicationService.overrideSelection(roundId, request)));
    }

    @PostMapping("/api/rounds/{roundId}/selection/finalize")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<com.enicarthage.incubator.dto.response.RoundResultResponse>> finalizeSelection(
            @PathVariable Long roundId) {
        return ResponseEntity.ok(ApiResponse.success("Liste finalisée et notifications envoyées", applicationService.finalizeSelection(roundId)));
    }
}
