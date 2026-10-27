package com.examly.springapp.controller;

import com.examly.springapp.model.AuditLog;
import com.examly.springapp.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @PostMapping
    public ResponseEntity<AuditLog> createAuditLog(@RequestBody AuditLog log) {
        if (log.getTimestamp() == null) {
            log.setTimestamp(java.time.LocalDateTime.now());
        }
        return new ResponseEntity<>(auditLogRepository.save(log), HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLog>> getLogsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(auditLogRepository.findByUserIdOrderByTimestampDesc(userId));
    }
}
