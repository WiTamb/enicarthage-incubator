package com.enicarthage.incubator.dto.response;

import com.enicarthage.incubator.model.RoundStatus;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RoundResponse {
    private Long id;
    private Long sessionId;
    private String name;
    private String description;
    private int orderIndex;
    private RoundStatus status;
    private List<UserResponse> evaluators;
}
