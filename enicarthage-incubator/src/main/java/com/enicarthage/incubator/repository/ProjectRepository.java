package com.enicarthage.incubator.repository;

import com.enicarthage.incubator.model.Project;
import com.enicarthage.incubator.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwnerId(Long ownerId);
    List<Project> findByStatus(ProjectStatus status);
    List<Project> findByProgramId(Long programId);
    List<Project> findByDomainContainingIgnoreCase(String domain);
    long countByStatus(ProjectStatus status);
    long countByProgramId(Long programId);
}
