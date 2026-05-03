package com.enicarthage.incubator.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rounds")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Round {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private Program program;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private int roundNumber;
    
    @Column(nullable = false)
    private int orderIndex;

    private LocalDate deadline;

    @Column(name = "passing_candidates_count")
    @Builder.Default
    private Integer passingCandidatesCount = 0;

    @Builder.Default
    private boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(20)")
    @Builder.Default
    private RoundStatus status = RoundStatus.UPCOMING;

    // Evaluators assigned specifically to this round
    @ManyToMany
    @JoinTable(
        name = "round_evaluators",
        joinColumns = @JoinColumn(name = "round_id"),
        inverseJoinColumns = @JoinColumn(name = "evaluator_id")
    )
    @Builder.Default
    private Set<User> evaluators = new HashSet<>();

    // The evaluator who acts as jury president for this round
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jury_president_id")
    private User juryPresident;

    // True once admin has reviewed and possibly overridden the selection list
    @Builder.Default
    private boolean selectionValidated = false;

    // True once jury president has validated — results are final and notifications sent
    @Builder.Default
    private boolean selectionFinalized = false;

    @OneToMany(mappedBy = "round", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<SessionQuestion> questions = new ArrayList<>();

    @OneToMany(mappedBy = "round", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<Project> projects = new java.util.ArrayList<>();

    public int getRoundNumber() {
        return roundNumber != 0 ? roundNumber : orderIndex;
    }

    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
        this.orderIndex = roundNumber;
    }
}
