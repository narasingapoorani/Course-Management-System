package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long courseId;

    private Long studentId;

    private String assessmentTitle;

    @Builder.Default
    private String assessmentType = "ASSIGNMENT"; // QUIZ, ASSIGNMENT, PROJECT, EXAM

    private Double maxScore;

    private Double achievedScore;

    private LocalDateTime submissionDate;

    private LocalDateTime dueDate;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private Long gradedBy;

    private LocalDateTime gradedDate;
}
