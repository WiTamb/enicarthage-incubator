package com.enicarthage.incubator.service;

import com.enicarthage.incubator.model.ProjectStatus;
import com.enicarthage.incubator.model.Role;
import com.enicarthage.incubator.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProgramRepository programRepository;
    private final EvaluationRepository evaluationRepository;

    public DashboardStats getDashboardStats() {
        return DashboardStats.builder()
                .totalUsers(userRepository.count())
                .totalStudents(userRepository.findByRole(Role.STUDENT).size())
                .totalEvaluators(userRepository.findByRole(Role.EVALUATOR).size())
                .totalProjects(projectRepository.count())
                .submittedProjects(projectRepository.countByStatus(ProjectStatus.SUBMITTED))
                .underReviewProjects(projectRepository.countByStatus(ProjectStatus.UNDER_REVIEW))
                .acceptedProjects(projectRepository.countByStatus(ProjectStatus.ACCEPTED))
                .rejectedProjects(projectRepository.countByStatus(ProjectStatus.REJECTED))
                .totalPrograms(programRepository.count())
                .activePrograms(programRepository.findByActive(true).size())
                .totalEvaluations(evaluationRepository.count())
                .build();
    }

    @Data
    @Builder
    public static class DashboardStats {
        private long totalUsers;
        private long totalStudents;
        private long totalEvaluators;
        private long totalProjects;
        private long submittedProjects;
        private long underReviewProjects;
        private long acceptedProjects;
        private long rejectedProjects;
        private long totalPrograms;
        private long activePrograms;
        private long totalEvaluations;
    }
}
