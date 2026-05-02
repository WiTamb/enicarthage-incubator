package com.enicarthage.incubator.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questionnaire_answers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionnaireAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private SessionQuestion question;

    // Stores text answer, selected option(s), or file path
    @Column(columnDefinition = "TEXT")
    private String answer;
}
