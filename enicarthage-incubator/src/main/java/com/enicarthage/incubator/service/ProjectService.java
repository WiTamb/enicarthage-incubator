package com.enicarthage.incubator.service;

import com.enicarthage.incubator.dto.request.ProjectRequest;
import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.*;
import com.enicarthage.incubator.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProgramRepository programRepository;
    private final RoundRepository roundRepository;
    private final ApplicationRepository applicationRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public Project submitProject(ProjectRequest request, MultipartFile document,
                                  MultipartFile image, String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        // Rule: Must have an active application in an open session
        Application application = applicationRepository.findByCandidateId(owner.getId()).stream()
                .filter(a -> a.getSession().getStatus() != SessionStatus.CLOSED)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Vous ne pouvez pas soumettre de projet sans session d'incubation active"));

        // Rule: Must be accepted for the current round
        if (!application.getStatus().name().startsWith("ACCEPTED") && application.getStatus() != ApplicationStatus.PENDING) {
             throw new IllegalStateException("Votre statut actuel (" + application.getStatus() + ") ne vous permet pas de soumettre de projet pour le moment.");
        }

        Round targetRound = application.getCurrentRound();
        
        // If no round set yet (first submission), default to Round 1 of the session
        if (targetRound == null) {
            targetRound = application.getSession().getRounds().stream()
                    .filter(r -> r.getOrderIndex() == 1)
                    .findFirst()
                    .orElse(null);
        }

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .domain(request.getDomain())
                .teamMembers(request.getTeamMembers())
                .videoUrl(request.getVideoUrl())
                .githubUrl(request.getGithubUrl())
                .owner(owner)
                .status(ProjectStatus.SUBMITTED)
                .round(targetRound) 
                .build();

        if (document != null && !document.isEmpty()) {
            String docPath = fileStorageService.store(document, "documents");
            project.setDocumentPath(docPath);
        }

        if (image != null && !image.isEmpty()) {
            String imgPath = fileStorageService.store(image, "images");
            project.setImagePath(imgPath);
        }

        Project saved = projectRepository.save(project);

        notificationService.createNotification(
                owner,
                "Votre projet \"" + saved.getTitle() + "\" a été soumis avec succès pour le " + 
                (project.getRound() != null ? project.getRound().getName() : "Round 1") + ".",
                "SUCCESS"
        );

        return saved;
    }

    public List<Project> getMyProjects(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return projectRepository.findByOwnerId(user.getId());
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<Project> getProjectsForEvaluator(String userEmail) {
        User evaluator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        
        if (evaluator.getRole() == Role.ADMIN) return getAllProjects();

        // Direct database filtering via rounds where evaluator is assigned
        return projectRepository.findAll().stream()
                .filter(p -> p.getRound() != null && 
                            p.getRound().getEvaluators() != null && 
                            p.getRound().getEvaluators().stream().anyMatch(e -> e.getId().equals(evaluator.getId())))
                .collect(Collectors.toList());
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable : " + id));
    }

    public Project updateStatus(Long projectId, ProjectStatus newStatus, String userEmail) {
        Project project = getProjectById(projectId);
        project.setStatus(newStatus);
        Project updated = projectRepository.save(project);

        String message = switch (newStatus) {
            case ACCEPTED -> "Félicitations ! Votre projet \"" + project.getTitle() + "\" a été accepté.";
            case REJECTED -> "Votre projet \"" + project.getTitle() + "\" n'a pas été retenu.";
            case UNDER_REVIEW -> "Votre projet \"" + project.getTitle() + "\" est en cours d'évaluation.";
            default -> "Le statut de votre projet a été mis à jour.";
        };

        notificationService.createNotification(project.getOwner(), message, "INFO");
        return updated;
    }

    public List<Project> getByStatus(ProjectStatus status) {
        return projectRepository.findByStatus(status);
    }

    public void deleteProject(Long id) {
        Project project = getProjectById(id);
        projectRepository.delete(project);
    }
}
