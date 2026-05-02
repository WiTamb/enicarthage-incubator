package com.enicarthage.incubator.controller;

import com.enicarthage.incubator.dto.request.ProjectRequest;
import com.enicarthage.incubator.dto.response.ApiResponse;
import com.enicarthage.incubator.model.Project;
import com.enicarthage.incubator.model.ProjectStatus;
import com.enicarthage.incubator.service.ProjectService;
import com.enicarthage.incubator.service.QuestionnaireService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final QuestionnaireService questionnaireService;

    // --- Étudiant : soumettre un projet ---
    @PostMapping
    public ResponseEntity<ApiResponse<Project>> submitProject(
            @RequestPart("project") String projectJson,
            @RequestPart(value = "document", required = false) MultipartFile document,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ProjectRequest request = mapper.readValue(projectJson, ProjectRequest.class);
            
            Project project = projectService.submitProject(request, document, image, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Projet soumis avec succès", project));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Données de projet invalides: " + e.getMessage()));
        }
    }

    // --- Étudiant : mes projets ---
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Project>>> getMyProjects(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Project> projects = projectService.getMyProjects(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Mes projets", projects));
    }

    // --- Récupérer un projet par ID ---
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Projet trouvé", projectService.getProjectById(id)));
    }

    // --- Admin/Évaluateur : tous les projets ---
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<List<Project>>> getAllProjects(
            @RequestParam(required = false) ProjectStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<Project> projects = projectService.getProjectsForEvaluator(userDetails.getUsername());
        
        if (status != null) {
            projects = projects.stream()
                    .filter(p -> p.getStatus() == status)
                    .collect(java.util.stream.Collectors.toList());
        }

        return ResponseEntity.ok(ApiResponse.success("Liste des projets", projects));
    }

    // --- Admin : changer le statut ---
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<Project>> updateStatus(
            @PathVariable Long id,
            @RequestParam ProjectStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {

        Project updated = projectService.updateStatus(id, status, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Statut mis à jour", updated));
    }

    // --- Admin : supprimer un projet ---
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success("Projet supprimé", null));
    }

    // --- Admin/Évaluateur : récupérer le questionnaire d'un projet ---
    @GetMapping("/{id}/questionnaire-answers")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<List<com.enicarthage.incubator.dto.response.QuestionnaireAnswerResponse>>> getProjectAnswers(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Réponses du candidat récupérées",
                questionnaireService.getAnswersForProject(id)));
    }
}
