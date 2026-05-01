package com.enicarthage.incubator.repository;

import com.enicarthage.incubator.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    @Query("SELECT DISTINCT s FROM Session s WHERE s.id IN (SELECT r.session.id FROM Round r JOIN r.evaluators e WHERE LOWER(e.email) = LOWER(:email))")
    List<Session> findByEvaluatorEmail(@Param("email") String email);
}
