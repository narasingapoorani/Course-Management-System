package com.examly.springapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;

    @NotBlank(message = "Title must not be empty")
    private String title;

    private String description;

    @Min(value = 1, message = "Duration must be at least 1 hour")
    private int duration;

    @NotNull(message = "Level is required")
    @Enumerated(EnumType.STRING)
    private Level level;

    @DecimalMin(value = "0.0", inclusive = true, message = "Price must not be negative")
    private double price;

    @JsonProperty("isActive")
    @Builder.Default
    private boolean isActive = true;

    private Long trainerId;
    private String trainerName;
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;

    @Builder.Default
    @Column(columnDefinition = "int default 50")
    private int capacity = 50;
    private String category;

    @Builder.Default
    private String status = "DRAFT";
    private Long approvedBy;
    private java.time.LocalDateTime approvalDate;

    @Column(columnDefinition = "TEXT")
    private String prerequisites;

    @Column(columnDefinition = "TEXT")
    private String learningObjectives;

    private String targetAudience;

    @Column(columnDefinition = "TEXT")
    private String reviewRemarks;
}