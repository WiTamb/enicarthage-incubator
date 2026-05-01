package com.enicarthage.incubator.controller;

import com.enicarthage.incubator.dto.request.RoundRequest;
import com.enicarthage.incubator.dto.response.ApiResponse;
import com.enicarthage.incubator.dto.response.RoundResponse;
import com.enicarthage.incubator.service.RoundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions/{sessionId}/rounds")
@RequiredArgsConstructor
public class RoundController {
    private final RoundService roundService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoundResponse>>> getRoundsBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.success("Rounds récupérés", roundService.getRoundsBySession(sessionId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoundResponse>> createRound(@PathVariable Long sessionId, @Valid @RequestBody RoundRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Round créé", roundService.createRound(sessionId, request)));
    }

    @PutMapping("/{roundId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoundResponse>> updateRound(@PathVariable Long sessionId, @PathVariable Long roundId, @Valid @RequestBody RoundRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Round mis à jour", roundService.updateRound(sessionId, roundId, request)));
    }

    @DeleteMapping("/{roundId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRound(@PathVariable Long sessionId, @PathVariable Long roundId) {
        roundService.deleteRound(sessionId, roundId);
        return ResponseEntity.ok(ApiResponse.success("Round supprimé", null));
    }
}
