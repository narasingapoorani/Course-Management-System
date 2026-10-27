package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trainers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trainer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String professionalName;

    private String qualifications;

    private String specializations;

    private Integer yearsExperience;

    private String certifications;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Double hourlyRate;

    private String licenseOrResumeUrl;

    @Builder.Default
    private String approvalStatus = "PENDING";

    private LocalDateTime approvalDate;

    private Long approvedBy;

    private String rejectionReason;
}
