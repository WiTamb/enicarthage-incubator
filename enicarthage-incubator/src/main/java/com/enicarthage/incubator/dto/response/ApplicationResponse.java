package com.enicarthage.incubator.dto.response;

import com.enicarthage.incubator.model.ApplicationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ApplicationResponse {
    private Long id;
    private Long sessionId;
    private String sessionName;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private Long currentRoundId;
    private String currentRoundName;
    private Integer currentRoundIndex;
    private ApplicationStatus status;
    private Double averageScore;  // average of all evaluator scores for the current round
    private List<EvaluationResponse> evaluationHistory;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
