package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long courseId;

    private String title;

    private String resourceType; // DOCUMENT, VIDEO, SLIDES, CODE_REPO

    @Column(columnDefinition = "TEXT")
    private String resourceUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Long uploadedBy;

    @Builder.Default
    private LocalDateTime uploadedDate = LocalDateTime.now();
}
