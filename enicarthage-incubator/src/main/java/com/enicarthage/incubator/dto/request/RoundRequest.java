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

    private Integer passingCandidatesCount;

    private RoundStatus status = RoundStatus.UPCOMING;

    /** IDs of evaluators assigned to this round */
    private List<Long> evaluatorIds;

    /** The evaluator who acts as jury president for this round (required) */
    @jakarta.validation.constraints.NotNull(message = "Le président du jury est obligatoire")
    private Long juryPresidentId;

    /** Questions required for this round */
    @jakarta.validation.constraints.NotEmpty(message = "Au moins une question est obligatoire pour ce round")
    private List<SessionQuestionRequest> questions;
}
