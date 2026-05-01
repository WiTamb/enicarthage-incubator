package com.enicarthage.incubator.service;

import com.enicarthage.incubator.dto.request.EvaluationRequest;
import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.Evaluation;
import com.enicarthage.incubator.model.Project;
import com.enicarthage.incubator.model.User;
import com.enicarthage.incubator.repository.EvaluationRepository;
import com.enicarthage.incubator.repository.ProjectRepository;
import com.enicarthage.incubator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public Evaluation evaluate(EvaluationRequest request, String evaluatorEmail) {
        User evaluator = userRepository.findByEmail(evaluatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluateur introuvable"));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable"));

        // Find existing evaluation for this SPECIFIC round by this evaluator
        // Rule: One evaluation per evaluator per round
        Optional<Evaluation> existing = (project.getRound() != null) 
            ? evaluationRepository.findAll().stream()
                .filter(e -> e.getProject().getId().equals(project.getId()) 
                          && e.getEvaluator().getId().equals(evaluator.getId())
                          && e.getRound() != null 
                          && e.getRound().getId().equals(project.getRound().getId()))
                .findFirst()
            : evaluationRepository.findByProjectIdAndEvaluatorId(project.getId(), evaluator.getId());

        Evaluation evaluation;
        if (existing.isPresent()) {
            evaluation = existing.get();
            evaluation.setScore(request.getScore());
            evaluation.setComment(request.getComment());
            evaluation.setRecommendation(request.getRecommendation());
        } else {
            evaluation = Evaluation.builder()
                    .project(project)
                    .evaluator(evaluator)
                    .round(project.getRound()) // Link to the current round of the project
                    .score(request.getScore())
                    .comment(request.getComment())
                    .recommendation(request.getRecommendation())
                    .build();
        }

        return evaluationRepository.save(evaluation);
    }

    public List<Evaluation> getEvaluationsByProject(Long projectId) {
        return evaluationRepository.findByProjectId(projectId);
    }

    public Double getAverageScore(Long projectId) {
        return evaluationRepository.findAverageScoreByProjectId(projectId).orElse(0.0);
    }
}
