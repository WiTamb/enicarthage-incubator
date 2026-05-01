package com.enicarthage.incubator.dto.request;

import com.enicarthage.incubator.model.SessionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class SessionRequest {
    @NotBlank(message = "Le nom de la session est obligatoire")
    private String name;

    private String description;

    @NotNull(message = "La date de début est obligatoire")
    private LocalDate startDate;

    @NotNull(message = "La date de fin est obligatoire")
    private LocalDate endDate;

    private SessionStatus status = SessionStatus.OPEN;
    
    private java.util.List<RoundRequest> rounds;
}
