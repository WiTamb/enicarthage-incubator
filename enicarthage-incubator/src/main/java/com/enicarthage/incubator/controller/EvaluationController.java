package com.enicarthage.incubator.controller;

import com.enicarthage.incubator.dto.request.EvaluationRequest;
import com.enicarthage.incubator.dto.response.ApiResponse;
import com.enicarthage.incubator.model.Evaluation;
import com.enicarthage.incubator.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<ApiResponse<Evaluation>> evaluate(
            @Valid @RequestBody EvaluationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Evaluation evaluation = evaluationService.evaluate(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Évaluation enregistrée", evaluation));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<Evaluation>>> getByProject(@PathVariable Long projectId) {
        List<Evaluation> evaluations = evaluationService.getEvaluationsByProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("Évaluations du projet", evaluations));
    }

    @GetMapping("/project/{projectId}/average")
    public ResponseEntity<ApiResponse<Double>> getAverageScore(@PathVariable Long projectId) {
        Double avg = evaluationService.getAverageScore(projectId);
        return ResponseEntity.ok(ApiResponse.success("Score moyen", avg));
    }
}
