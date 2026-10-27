package com.examly.springapp.controller;

import com.examly.springapp.model.Trainer;
import com.examly.springapp.repository.TrainerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainers")
public class TrainerController {

    @Autowired
    private TrainerRepository trainerRepository;

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

    @GetMapping
    public ResponseEntity<List<Trainer>> getAllTrainers() {
        return ResponseEntity.ok(trainerRepository.findAll());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Trainer>> getPendingTrainers() {
        return ResponseEntity.ok(trainerRepository.findAll().stream()
                .filter(t -> "PENDING".equalsIgnoreCase(t.getApprovalStatus()))
                .toList());
    }

    @GetMapping("/me")
    public ResponseEntity<Trainer> getCurrentTrainer() {
        Long userId = getAuthenticatedUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return trainerRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trainer> getTrainerById(@PathVariable Long id) {
        return trainerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Trainer> registerTrainer(@RequestBody Trainer trainer) {
        if (trainer.getApprovalStatus() == null) {
            trainer.setApprovalStatus("PENDING");
        }
        Trainer saved = trainerRepository.save(trainer);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trainer> updateTrainer(@PathVariable Long id, @RequestBody Trainer trainer) {
        return trainerRepository.findById(id).map(t -> {
            if (trainer.getProfessionalName() != null) t.setProfessionalName(trainer.getProfessionalName());
            if (trainer.getQualifications() != null) t.setQualifications(trainer.getQualifications());
            if (trainer.getSpecializations() != null) t.setSpecializations(trainer.getSpecializations());
            if (trainer.getYearsExperience() != null) t.setYearsExperience(trainer.getYearsExperience());
            if (trainer.getCertifications() != null) t.setCertifications(trainer.getCertifications());
            if (trainer.getBio() != null) t.setBio(trainer.getBio());
            if (trainer.getHourlyRate() != null) t.setHourlyRate(trainer.getHourlyRate());
            if (trainer.getLicenseOrResumeUrl() != null) t.setLicenseOrResumeUrl(trainer.getLicenseOrResumeUrl());
            return ResponseEntity.ok(trainerRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Trainer> updateTrainerStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        Long reviewerId = getAuthenticatedUserId();
        return trainerRepository.findById(id).map(t -> {
            t.setApprovalStatus(status.toUpperCase());
            t.setApprovalDate(java.time.LocalDateTime.now());
            if (reviewerId != null) {
                t.setApprovedBy(reviewerId);
            }
            if (reason != null && !reason.isBlank()) {
                t.setRejectionReason(reason);
            }
            return ResponseEntity.ok(trainerRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }
}
