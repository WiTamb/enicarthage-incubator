package com.enicarthage.incubator.dto.response;

import com.enicarthage.incubator.model.QuestionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SessionQuestionResponse {
    private Long id;
    private Long roundId;
    private String label;
    private QuestionType type;
    private String options;
    private boolean required;
    private int orderIndex;
}
