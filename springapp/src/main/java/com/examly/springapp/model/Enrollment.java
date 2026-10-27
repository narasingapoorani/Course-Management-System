package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long courseId;

    private Long studentId;

    @Builder.Default
    private LocalDateTime enrollmentDate = LocalDateTime.now();

    @Builder.Default
    private String status = "ENROLLED"; // ENROLLED, COMPLETED, WITHDRAWN, FAILED

    @Builder.Default
    private Double progressPercentage = 0.0;

    private LocalDateTime completionDate;

    private String finalGrade;

    @Builder.Default
    private Boolean certificateIssued = false;
}
