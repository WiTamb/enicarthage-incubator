package com.enicarthage.incubator.controller;

import com.enicarthage.incubator.dto.response.ApiResponse;
import com.enicarthage.incubator.model.EventRegistration;
import com.enicarthage.incubator.model.User;
import com.enicarthage.incubator.service.EventRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/registrations")
@RequiredArgsConstructor
public class EventRegistrationController {

    private final EventRegistrationService registrationService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<EventRegistration>> register(
            @PathVariable Long eventId,
            @AuthenticationPrincipal User user) {
        EventRegistration registration = registrationService.registerForEvent(eventId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Inscription réussie", registration));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EventRegistration>>> getParticipants(@PathVariable Long eventId) {
        List<EventRegistration> participants = registrationService.getParticipantsByEvent(eventId);
        return ResponseEntity.ok(ApiResponse.success("Liste des participants", participants));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Boolean>> checkRegistrationStatus(
            @PathVariable Long eventId,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.ok(ApiResponse.success("Non connecté", false));
        }
        boolean registered = registrationService.isRegistered(eventId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Statut d'inscription", registered));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getParticipantCount(@PathVariable Long eventId) {
        long count = registrationService.getParticipantCount(eventId);
        return ResponseEntity.ok(ApiResponse.success("Nombre de participants", count));
    }

    @GetMapping("/test-error")
    public ResponseEntity<ApiResponse<String>> testError(@PathVariable Long eventId) {
        try {
            List<EventRegistration> participants = registrationService.getParticipantsByEvent(eventId);
            return ResponseEntity.ok(ApiResponse.success("Success", new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(participants)));
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            return ResponseEntity.status(500).body(ApiResponse.error(sw.toString()));
        }
    }
}
