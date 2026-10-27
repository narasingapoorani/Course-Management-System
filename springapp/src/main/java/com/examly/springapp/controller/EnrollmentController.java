package com.examly.springapp.controller;

import com.examly.springapp.model.Enrollment;
import com.examly.springapp.repository.EnrollmentRepository;
import com.examly.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Enrollment>> getAllEnrollments() {
        return ResponseEntity.ok(enrollmentRepository.findAll());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getStudentEnrollments(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentRepository.findByStudentId(studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> getEnrollmentById(@PathVariable Long id) {
        return enrollmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = {"/my-enrollments", "/my"})
    public ResponseEntity<List<Enrollment>> getMyEnrollments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String username = auth.getName();
            return userRepository.findByUsername(username)
                    .map(u -> ResponseEntity.ok(enrollmentRepository.findByStudentId(u.getId())))
                    .orElse(ResponseEntity.ok(List.of()));
        }
        return ResponseEntity.ok(List.of());
    }

    @PostMapping
    public ResponseEntity<Enrollment> enrollStudent(@RequestBody Enrollment enrollment) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String username = auth.getName();
            userRepository.findByUsername(username).ifPresent(u -> enrollment.setStudentId(u.getId()));
        }

        // Prevent duplicate active enrollment
        if (enrollment.getCourseId() != null && enrollment.getStudentId() != null) {
            var existing = enrollmentRepository.findByCourseIdAndStudentId(enrollment.getCourseId(), enrollment.getStudentId());
            if (existing.isPresent()) {
                return ResponseEntity.ok(existing.get());
            }
        }

        if (enrollment.getEnrollmentDate() == null) {
            enrollment.setEnrollmentDate(java.time.LocalDateTime.now());
        }
        if (enrollment.getStatus() == null) {
            enrollment.setStatus("ENROLLED");
        }
        Enrollment saved = enrollmentRepository.save(enrollment);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<Enrollment> updateProgress(@PathVariable Long id, @RequestParam Double progressPercentage) {
        return enrollmentRepository.findById(id).map(e -> {
            e.setProgressPercentage(progressPercentage);
            if (progressPercentage >= 100.0) {
                e.setStatus("COMPLETED");
                e.setCompletionDate(java.time.LocalDateTime.now());
                e.setCertificateIssued(true);
            }
            return ResponseEntity.ok(enrollmentRepository.save(e));
        }).orElse(ResponseEntity.notFound().build());
    }
}
