package com.enicarthage.incubator.repository;

import com.enicarthage.incubator.model.Round;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoundRepository extends JpaRepository<Round, Long> {
    List<Round> findBySessionIdOrderByOrderIndexAsc(Long sessionId);
    List<Round> findByProgramId(Long programId);
}
