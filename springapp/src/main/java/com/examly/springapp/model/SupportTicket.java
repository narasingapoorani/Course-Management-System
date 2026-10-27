package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String username;

    private String subject;

    private String category; // ACADEMIC, TECHNICAL, ENROLLMENT, GENERAL

    @Column(columnDefinition = "TEXT")
    private String message;

    @Builder.Default
    private String status = "OPEN"; // OPEN, RESOLVED, IN_PROGRESS

    @Column(columnDefinition = "TEXT")
    private String response;

    private Long respondedBy;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime respondedAt;
}
