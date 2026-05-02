package com.enicarthage.incubator.repository;

import com.enicarthage.incubator.model.QuestionnaireAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionnaireAnswerRepository extends JpaRepository<QuestionnaireAnswer, Long> {
    List<QuestionnaireAnswer> findByApplicationId(Long applicationId);
}
