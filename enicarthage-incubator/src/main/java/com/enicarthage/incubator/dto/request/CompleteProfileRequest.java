package com.enicarthage.incubator.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompleteProfileRequest {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotBlank
    private String password;
    
    private String specialty;
}
