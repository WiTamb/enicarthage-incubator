package com.enicarthage.incubator.dto.response;

import com.enicarthage.incubator.model.SessionStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class SessionResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private SessionStatus status;
    private List<RoundResponse> rounds;
    private Long totalApplicants;
}
