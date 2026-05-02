package com.enicarthage.incubator.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;
    private LocalDateTime eventDate;
    private String imagePath;
    private String videoUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean registrationEnabled = false;

    private Integer maxParticipants;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
