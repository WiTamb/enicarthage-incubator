package com.enicarthage.incubator.repository;

import com.enicarthage.incubator.model.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByProjectId(Long projectId);
    List<Evaluation> findByEvaluatorId(Long evaluatorId);
    Optional<Evaluation> findByProjectIdAndEvaluatorId(Long projectId, Long evaluatorId);

    @Query("SELECT AVG(e.score) FROM Evaluation e WHERE e.project.id = :projectId")
    Optional<Double> findAverageScoreByProjectId(Long projectId);
}
