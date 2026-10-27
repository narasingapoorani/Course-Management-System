package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    private String email;

    @Column(nullable = false)
    private String password;

    private String role;

    private String phoneNumber;

    private java.time.LocalDateTime createdDate;

    private java.time.LocalDateTime lastLogin;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "email_verified")
    private Boolean emailVerified = false;
}