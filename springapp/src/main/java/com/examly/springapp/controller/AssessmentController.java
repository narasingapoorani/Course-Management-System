package com.examly.springapp.controller;

import com.examly.springapp.model.Assessment;
import com.examly.springapp.repository.AssessmentRepository;
import com.examly.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Assessment>> getAllAssessments() {
        return ResponseEntity.ok(assessmentRepository.findAll());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Assessment>> getCourseAssessments(@PathVariable Long courseId) {
        return ResponseEntity.ok(assessmentRepository.findByCourseId(courseId));
    }

    @PostMapping
    public ResponseEntity<Assessment> createOrSubmitAssessment(@RequestBody Assessment assessment) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String username = auth.getName();
            userRepository.findByUsername(username).ifPresent(u -> {
                if ("STUDENT".equals(u.getRole()) && assessment.getStudentId() == null) {
                    assessment.setStudentId(u.getId());
                }
            });
        }

        if (assessment.getSubmissionDate() == null) {
            assessment.setSubmissionDate(java.time.LocalDateTime.now());
        }
        Assessment saved = assessmentRepository.save(assessment);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Assessment> submitAssessment(
            @PathVariable Long id,
            @RequestBody(required = false) Assessment submission) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long studentId = null;
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            var u = userRepository.findByUsername(auth.getName());
            if (u.isPresent()) studentId = u.get().getId();
        }

        final Long finalStudentId = studentId;
        return assessmentRepository.findById(id).map(a -> {
            if (finalStudentId != null) a.setStudentId(finalStudentId);
            a.setSubmissionDate(java.time.LocalDateTime.now());
            if (submission != null && submission.getFeedback() != null) {
                a.setFeedback(submission.getFeedback());
            }
            return ResponseEntity.ok(assessmentRepository.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    @RequestMapping(value = "/{id}/grade", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Assessment> gradeAssessment(
            @PathVariable Long id,
            @RequestParam Double score,
            @RequestParam(required = false) String feedback) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long graderId = null;
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            var u = userRepository.findByUsername(auth.getName());
            if (u.isPresent()) graderId = u.get().getId();
        }

        final Long finalGraderId = graderId;
        return assessmentRepository.findById(id).map(a -> {
            a.setAchievedScore(score);
            if (feedback != null) a.setFeedback(feedback);
            a.setGradedBy(finalGraderId);
            a.setGradedDate(java.time.LocalDateTime.now());
            return ResponseEntity.ok(assessmentRepository.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }
}
