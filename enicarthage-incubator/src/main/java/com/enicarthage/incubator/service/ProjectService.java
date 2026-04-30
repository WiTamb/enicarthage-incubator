package com.enicarthage.incubator.service;

import com.enicarthage.incubator.dto.request.ProjectRequest;
import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.*;
import com.enicarthage.incubator.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProgramRepository programRepository;
    private final RoundRepository roundRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public Project submitProject(ProjectRequest request, MultipartFile document,
                                  MultipartFile image, String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        Program program = programRepository.findById(request.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable"));

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .domain(request.getDomain())
                .teamMembers(request.getTeamMembers())
                .videoUrl(request.getVideoUrl())
                .owner(owner)
                .program(program)
                .status(ProjectStatus.SUBMITTED)
                .build();

        if (request.getRoundId() != null) {
            Round round = roundRepository.findById(request.getRoundId())
                    .orElseThrow(() -> new ResourceNotFoundException("Round introuvable"));
            project.setRound(round);
        }

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
                "Votre projet \"" + saved.getTitle() + "\" a été soumis avec succès.",
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
