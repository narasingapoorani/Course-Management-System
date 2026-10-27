package com.examly.springapp.controller;

import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ResourceAndSupportController {

    @Autowired
    private CourseResourceRepository courseResourceRepository;

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return userRepository.findByUsername(auth.getName()).map(User::getId).orElse(null);
        }
        return null;
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    // --- FR14: Learning Resources ---
    @GetMapping("/resources/course/{courseId}")
    public ResponseEntity<List<CourseResource>> getResourcesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseResourceRepository.findByCourseId(courseId));
    }

    @PostMapping("/resources")
    public ResponseEntity<CourseResource> createResource(@RequestBody CourseResource resource) {
        Long userId = getCurrentUserId();
        if (resource.getUploadedBy() == null) {
            resource.setUploadedBy(userId);
        }
        if (resource.getUploadedDate() == null) {
            resource.setUploadedDate(LocalDateTime.now());
        }
        return new ResponseEntity<>(courseResourceRepository.save(resource), HttpStatus.CREATED);
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        courseResourceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- FR15: Student Support Tickets ---
    @GetMapping("/support")
    public ResponseEntity<List<SupportTicket>> getAllSupportTickets() {
        return ResponseEntity.ok(supportTicketRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/support/my")
    public ResponseEntity<List<SupportTicket>> getMySupportTickets() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(supportTicketRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping("/support")
    public ResponseEntity<SupportTicket> createSupportTicket(@RequestBody SupportTicket ticket) {
        Long userId = getCurrentUserId();
        String username = getCurrentUsername();
        ticket.setUserId(userId);
        ticket.setUsername(username != null ? username : "student");
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        return new ResponseEntity<>(supportTicketRepository.save(ticket), HttpStatus.CREATED);
    }

    @PutMapping("/support/{id}/respond")
    public ResponseEntity<SupportTicket> respondSupportTicket(@PathVariable Long id, @RequestBody SupportTicket responsePayload) {
        return supportTicketRepository.findById(id).map(ticket -> {
            ticket.setResponse(responsePayload.getResponse());
            ticket.setStatus("RESOLVED");
            ticket.setRespondedBy(getCurrentUserId());
            ticket.setRespondedAt(LocalDateTime.now());
            return ResponseEntity.ok(supportTicketRepository.save(ticket));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- FR10: Notification and Alerts ---
    @GetMapping("/notifications/my")
    public ResponseEntity<List<Notification>> getMyNotifications() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping("/notifications")
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        return new ResponseEntity<>(notificationRepository.save(notification), HttpStatus.CREATED);
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Notification> markNotificationRead(@PathVariable Long id) {
        return notificationRepository.findById(id).map(notif -> {
            notif.setIsRead(true);
            return ResponseEntity.ok(notificationRepository.save(notif));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- FR12: AI Course Recommendations ---
    @GetMapping("/recommendations")
    public ResponseEntity<List<Course>> getRecommendations(@RequestParam(required = false) String category) {
        List<Course> approvedCourses = courseRepository.findAll().stream()
                .filter(c -> "APPROVED".equalsIgnoreCase(c.getStatus()) && c.isActive())
                .collect(Collectors.toList());

        if (category != null && !category.isBlank()) {
            List<Course> matching = approvedCourses.stream()
                    .filter(c -> category.equalsIgnoreCase(c.getCategory()))
                    .collect(Collectors.toList());
            if (!matching.isEmpty()) {
                return ResponseEntity.ok(matching);
            }
        }
        return ResponseEntity.ok(approvedCourses.stream().limit(4).collect(Collectors.toList()));
    }
}
