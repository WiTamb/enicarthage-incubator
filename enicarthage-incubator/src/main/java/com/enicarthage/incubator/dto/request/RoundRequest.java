package com.enicarthage.incubator.dto.request;

import com.enicarthage.incubator.model.RoundStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class RoundRequest {
    @NotBlank(message = "Le nom du round est obligatoire")
    private String name;

    private String description;

    private int orderIndex;

    private RoundStatus status = RoundStatus.UPCOMING;

    // IDs of evaluators assigned to this round
    private List<Long> evaluatorIds;
}
