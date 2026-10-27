package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long courseId;

    private String sessionTitle;

    private LocalDate sessionDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String location;

    private String roomNumber;

    @Builder.Default
    private Integer maxCapacity = 50;

    @Builder.Default
    private Integer enrolledCount = 0;

    @Builder.Default
    private String sessionType = "LECTURE"; // LECTURE, WORKSHOP, PRACTICAL, ASSESSMENT
}
