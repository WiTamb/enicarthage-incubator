package com.enicarthage.incubator.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class SelectionOverrideRequest {
    /** List of per-candidate decisions */
    private List<CandidateDecision> decisions;

    @Data
    public static class CandidateDecision {
        private Long applicationId;
        private boolean accepted;
        /** Mandatory justification for any change */
        private String justification;
    }
}
