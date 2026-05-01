package com.enicarthage.incubator.controller;

import com.enicarthage.incubator.dto.request.SessionRequest;
import com.enicarthage.incubator.dto.response.ApiResponse;
import com.enicarthage.incubator.dto.response.SessionResponse;
import com.enicarthage.incubator.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.enicarthage.incubator.model.Role;
import com.enicarthage.incubator.repository.UserRepository;
import com.enicarthage.incubator.model.User;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {
    private final SessionService sessionService;

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getAllSessions(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        System.out.println("DEBUG: Fetching sessions for user " + email + " with role " + user.getRole());

        if (user.getRole() == Role.EVALUATOR) {
            List<SessionResponse> evalSessions = sessionService.getSessionsForEvaluator(user.getEmail());
            System.out.println("DEBUG: Found " + evalSessions.size() + " sessions for evaluator");
            return ResponseEntity.ok(ApiResponse.success("Vos sessions assignées", evalSessions));
        } else {
            List<SessionResponse> allSessions = sessionService.getAllSessions();
            System.out.println("DEBUG: Found " + allSessions.size() + " sessions for non-evaluator (Admin/Student)");
            return ResponseEntity.ok(ApiResponse.success("Sessions disponibles", allSessions));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSessionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        if (user.getRole() == Role.ADMIN || user.getRole() == Role.STUDENT) {
            return ResponseEntity.ok(ApiResponse.success("Détails de la session", sessionService.getSessionById(id)));
        } else {
            return ResponseEntity.ok(ApiResponse.success("Détails de votre session", sessionService.getSessionByIdForEvaluator(id, user.getEmail())));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(@Valid @RequestBody SessionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Session créée", sessionService.createSession(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SessionResponse>> updateSession(@PathVariable Long id, @Valid @RequestBody SessionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Session mise à jour", sessionService.updateSession(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.ok(ApiResponse.success("Session supprimée", null));
    }
}
