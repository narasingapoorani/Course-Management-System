package com.examly.springapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import com.examly.springapp.model.Course;
import com.examly.springapp.service.CourseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/courses")
@SecurityRequirement(name = "Bearer Authentication")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private com.examly.springapp.repository.TrainerRepository trainerRepository;

    @Autowired
    private com.examly.springapp.repository.UserRepository userRepository;

    private Long getAuthenticatedUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String username = auth.getName();
            return userRepository.findByUsername(username).map(com.examly.springapp.model.User::getId).orElse(null);
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@Valid @RequestBody Course course) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String username = auth.getName();
            com.examly.springapp.model.User u = userRepository.findByUsername(username).orElse(null);
            if (u != null) {
                if ("STUDENT".equalsIgnoreCase(u.getRole())) {
                    throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Students are not permitted to create courses.");
                }
                if ("TRAINER".equalsIgnoreCase(u.getRole())) {
                    com.examly.springapp.model.Trainer tr = trainerRepository.findByUserId(u.getId()).orElse(null);
                    if (tr != null && !"APPROVED".equalsIgnoreCase(tr.getApprovalStatus())) {
                        throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Trainer account is pending administrator verification. Course creation will be unlocked once approved.");
                    }
                }
                if (course.getTrainerId() == null) {
                    course.setTrainerId(u.getId());
                }
                if (course.getTrainerName() == null || course.getTrainerName().isBlank()) {
                    course.setTrainerName(u.getUsername());
                }
            }
        }
        return new ResponseEntity<>(courseService.createCourse(course), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses(
            @RequestParam(required = false) Boolean active) {

        if (active == null) {
            return ResponseEntity.ok(courseService.getAllCourses());
        }

        return ResponseEntity.ok(courseService.getCoursesByActive(active));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody Course course) {

        return ResponseEntity.ok(courseService.updateCourse(id, course));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Course> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Long reviewerId = getAuthenticatedUserId();
        return ResponseEntity.ok(courseService.updateCourseStatus(id, status, reviewerId));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Course> approveCourse(@PathVariable Long id) {
        Long reviewerId = getAuthenticatedUserId();
        return ResponseEntity.ok(courseService.updateCourseStatus(id, "APPROVED", reviewerId));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Course> rejectCourse(@PathVariable Long id) {
        Long reviewerId = getAuthenticatedUserId();
        return ResponseEntity.ok(courseService.updateCourseStatus(id, "REJECTED", reviewerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}