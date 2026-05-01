package com.enicarthage.incubator.repository;

import com.enicarthage.incubator.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findBySessionId(Long sessionId);
    List<Application> findByCandidateId(Long candidateId);
    Optional<Application> findBySessionIdAndCandidateId(Long sessionId, Long candidateId);
    boolean existsBySessionIdAndCandidateId(Long sessionId, Long candidateId);
    long countBySessionId(Long sessionId);
    long countByCurrentRoundId(Long roundId);
}
