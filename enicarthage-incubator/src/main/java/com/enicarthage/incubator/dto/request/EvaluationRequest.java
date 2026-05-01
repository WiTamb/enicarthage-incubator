package com.enicarthage.incubator.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EvaluationRequest {
    private Long projectId;
    
    @Min(0) @Max(100)
    private Integer score;
    
    @NotBlank
    private String comment;
    
    private String recommendation;
}
