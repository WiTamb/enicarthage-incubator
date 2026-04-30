package com.enicarthage.incubator.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class EvaluationRequest {

    @NotNull(message = "Le projet est obligatoire")
    private Long projectId;

    @NotNull(message = "Le score est obligatoire")
    @Min(value = 0, message = "Le score minimum est 0")
    @Max(value = 100, message = "Le score maximum est 100")
    private Integer score;

    @NotBlank(message = "Le commentaire est obligatoire")
    private String comment;

    private String recommendation;
}
