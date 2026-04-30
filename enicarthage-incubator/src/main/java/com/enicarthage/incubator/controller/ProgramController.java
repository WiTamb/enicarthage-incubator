package com.enicarthage.incubator.controller;

import com.enicarthage.incubator.dto.response.ApiResponse;
import com.enicarthage.incubator.model.Program;
import com.enicarthage.incubator.model.Round;
import com.enicarthage.incubator.service.ProgramService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService programService;

    // --- Public ---
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<Program>>> getActivePrograms() {
        return ResponseEntity.ok(ApiResponse.success("Programmes actifs", programService.getActivePrograms()));
    }

    @GetMapping("/public/{id}/rounds")
    public ResponseEntity<ApiResponse<List<Round>>> getRoundsByProgram(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Rounds du programme", programService.getRoundsByProgram(id)));
    }

    // --- Admin ---
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Program>>> getAllPrograms() {
        return ResponseEntity.ok(ApiResponse.success("Tous les programmes", programService.getAllPrograms()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Program>> createProgram(@RequestBody Program program) {
        return ResponseEntity.ok(ApiResponse.success("Programme créé", programService.createProgram(program)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Program>> updateProgram(
            @PathVariable Long id, @RequestBody Program program) {
        return ResponseEntity.ok(ApiResponse.success("Programme mis à jour", programService.updateProgram(id, program)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProgram(@PathVariable Long id) {
        programService.deleteProgram(id);
        return ResponseEntity.ok(ApiResponse.success("Programme supprimé", null));
    }

    // --- Rounds ---
    @PostMapping("/{id}/rounds")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Round>> createRound(
            @PathVariable Long id, @RequestBody Round round) {
        Program program = programService.getProgramById(id);
        round.setProgram(program);
        return ResponseEntity.ok(ApiResponse.success("Round créé", programService.createRound(round)));
    }

    @PutMapping("/rounds/{roundId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Round>> updateRound(
            @PathVariable Long roundId, @RequestBody Round round) {
        return ResponseEntity.ok(ApiResponse.success("Round mis à jour", programService.updateRound(roundId, round)));
    }

    @DeleteMapping("/rounds/{roundId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRound(@PathVariable Long roundId) {
        programService.deleteRound(roundId);
        return ResponseEntity.ok(ApiResponse.success("Round supprimé", null));
    }
}
