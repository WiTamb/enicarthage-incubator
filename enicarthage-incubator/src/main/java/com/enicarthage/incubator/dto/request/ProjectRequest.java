package com.enicarthage.incubator.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProjectRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    private String domain;
    private String teamMembers;
    private String videoUrl;
    private String githubUrl;

    @NotNull(message = "Le programme est obligatoire")
    private Long programId;

    private Long roundId;
}
