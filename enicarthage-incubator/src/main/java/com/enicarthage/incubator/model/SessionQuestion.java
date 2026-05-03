package com.enicarthage.incubator.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "session_questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QuestionType type;

    // Comma-separated options for RADIO / CHECKBOX types
    @Column(columnDefinition = "TEXT")
    private String options;

    @Column(nullable = false)
    @Builder.Default
    private boolean required = true;

    @Column(nullable = false)
    @Builder.Default
    private int orderIndex = 0;
}
