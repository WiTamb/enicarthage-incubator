package com.enicarthage.incubator.repository;

import com.enicarthage.incubator.model.SessionQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionQuestionRepository extends JpaRepository<SessionQuestion, Long> {
    List<SessionQuestion> findBySessionIdOrderByOrderIndexAsc(Long sessionId);
    void deleteBySessionId(Long sessionId);
}
