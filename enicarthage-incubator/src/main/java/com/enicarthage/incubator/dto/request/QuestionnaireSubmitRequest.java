package com.enicarthage.incubator.dto.request;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class QuestionnaireSubmitRequest {
    // Map of questionId -> answer string (for checkboxes: comma-separated values)
    private Map<Long, String> answers;
}
