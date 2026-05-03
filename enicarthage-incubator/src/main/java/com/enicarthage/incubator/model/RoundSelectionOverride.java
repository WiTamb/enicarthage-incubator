package com.enicarthage.incubator.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Records admin overrides to the auto-generated selection list for a round.
 * Every change must carry a written justification.
 */
@Entity
@Table(name = "round_selection_overrides")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoundSelectionOverride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    /** true = admin chose to accept this candidate, false = admin chose to reject */
    @Column(nullable = false)
    private boolean accepted;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String justification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modified_by_id", nullable = false)
    private User modifiedBy;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime modifiedAt = LocalDateTime.now();
}
