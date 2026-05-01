package com.enicarthage.incubator.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer score; // 0-100

    @Column(columnDefinition = "TEXT")
    private String comment;

    private String recommendation;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime evaluatedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "evaluator_id", nullable = false)
    private User evaluator;

    // Link evaluation to a specific round
    @ManyToOne
    @JoinColumn(name = "round_id")
    private Round round;
}
