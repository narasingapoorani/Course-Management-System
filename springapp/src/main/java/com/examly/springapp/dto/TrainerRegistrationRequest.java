package com.examly.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerRegistrationRequest {
    private String username;
    private String email;
    private String password;
    private String phoneNumber;
    private String professionalName;
    private String qualifications;
    private String specializations;
    private Integer yearsExperience;
    private String certifications;
    private String bio;
    private Double hourlyRate;
    private String licenseOrResumeUrl;
}
