package com.examly.springapp.config;

import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@enterprise.edu")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ADMIN")
                    .isActive(true)
                    .emailVerified(true)
                    .createdDate(LocalDateTime.now())
                    .build();
            userRepository.save(admin);
        }

        if (userRepository.findByUsername("manager").isEmpty()) {
            User manager = User.builder()
                    .username("manager")
                    .email("manager@enterprise.edu")
                    .password(passwordEncoder.encode("manager123"))
                    .role("TRAINING_MANAGER")
                    .isActive(true)
                    .emailVerified(true)
                    .createdDate(LocalDateTime.now())
                    .build();
            userRepository.save(manager);
        }

        if (userRepository.findByUsername("trainer").isEmpty()) {
            User trainer = User.builder()
                    .username("trainer")
                    .email("trainer@enterprise.edu")
                    .password(passwordEncoder.encode("trainer123"))
                    .role("TRAINER")
                    .isActive(true)
                    .emailVerified(true)
                    .createdDate(LocalDateTime.now())
                    .build();
            trainer = userRepository.save(trainer);

            Trainer trainerProfile = Trainer.builder()
                    .userId(trainer.getId())
                    .professionalName("Dr. Sarah Jenkins")
                    .qualifications("Ph.D. Computer Science, AWS Certified Solutions Architect")
                    .specializations("Cloud Computing, Microservices, Spring Boot")
                    .yearsExperience(12)
                    .certifications("AWS Solutions Architect Pro, Certified Kubernetes Admin")
                    .bio("Senior Technical Educator with 12+ years experience building enterprise systems.")
                    .hourlyRate(120.0)
                    .approvalStatus("APPROVED")
                    .approvalDate(LocalDateTime.now())
                    .build();
            trainerRepository.save(trainerProfile);
        }

        if (userRepository.findByUsername("student").isEmpty()) {
            User student = User.builder()
                    .username("student")
                    .email("student@enterprise.edu")
                    .password(passwordEncoder.encode("student123"))
                    .role("STUDENT")
                    .isActive(true)
                    .emailVerified(true)
                    .createdDate(LocalDateTime.now())
                    .build();
            userRepository.save(student);
        }

        if (courseRepository.count() == 0) {
            User trainerUser = userRepository.findByUsername("trainer").orElse(null);
            Long trainerId = trainerUser != null ? trainerUser.getId() : null;
            String trainerName = trainerUser != null ? trainerUser.getUsername() : "trainer";

            Course c1 = Course.builder()
                    .title("Fullstack Spring Boot & Microservices")
                    .description("Master enterprise backend architectures with Spring Boot 3, Spring Security, JWT, Docker, and REST APIs.")
                    .duration(40)
                    .level(Level.INTERMEDIATE)
                    .price(199.99)
                    .category("Software Development")
                    .capacity(45)
                    .startDate(LocalDate.now().plusDays(5))
                    .endDate(LocalDate.now().plusDays(45))
                    .status("APPROVED")
                    .isActive(true)
                    .trainerId(trainerId)
                    .trainerName(trainerName)
                    .approvedBy(1L)
                    .approvalDate(LocalDateTime.now())
                    .build();
            c1 = courseRepository.save(c1);

            Course c2 = Course.builder()
                    .title("Advanced React & Modern UI Architectures")
                    .description("Build blazing-fast modern web applications with React 18, State Management, Custom Hooks, and Glassmorphic CSS.")
                    .duration(30)
                    .level(Level.ADVANCED)
                    .price(149.99)
                    .category("Software Development")
                    .capacity(50)
                    .startDate(LocalDate.now().plusDays(7))
                    .endDate(LocalDate.now().plusDays(37))
                    .status("APPROVED")
                    .isActive(true)
                    .trainerId(trainerId)
                    .trainerName(trainerName)
                    .approvedBy(1L)
                    .approvalDate(LocalDateTime.now())
                    .build();
            c2 = courseRepository.save(c2);

            Course c3 = Course.builder()
                    .title("Cloud Infrastructure & DevOps CI/CD")
                    .description("Automate enterprise delivery with Kubernetes, Docker containers, GitHub Actions, and Terraform provisioning.")
                    .duration(35)
                    .level(Level.ADVANCED)
                    .price(249.99)
                    .category("Cloud Architecture & DevOps")
                    .capacity(30)
                    .startDate(LocalDate.now().plusDays(10))
                    .endDate(LocalDate.now().plusDays(50))
                    .status("APPROVED")
                    .isActive(true)
                    .trainerId(trainerId)
                    .trainerName(trainerName)
                    .approvedBy(1L)
                    .approvalDate(LocalDateTime.now())
                    .build();
            c3 = courseRepository.save(c3);

            Course c4 = Course.builder()
                    .title("Python for Data Science & AI Models")
                    .description("Hands-on machine learning, predictive analytics, neural networks with PyTorch, and NLP architectures.")
                    .duration(50)
                    .level(Level.BEGINNER)
                    .price(179.99)
                    .category("Data Science & Artificial Intelligence")
                    .capacity(60)
                    .startDate(LocalDate.now().plusDays(12))
                    .endDate(LocalDate.now().plusDays(62))
                    .status("APPROVED")
                    .isActive(true)
                    .trainerId(trainerId)
                    .trainerName(trainerName)
                    .approvedBy(1L)
                    .approvalDate(LocalDateTime.now())
                    .prerequisites("Basic Python programming")
                    .learningObjectives("Build predictive models, fine-tune neural networks, analyze datasets")
                    .targetAudience("Aspiring Data Scientists and Analysts")
                    .build();
            courseRepository.save(c4);

            Course pendingCourse = Course.builder()
                    .title("Cybersecurity Defense & Zero-Trust Architecture")
                    .description("Learn perimeter security, threat modeling, vulnerability scanning, and enterprise encryption standards.")
                    .duration(45)
                    .level(Level.ADVANCED)
                    .price(220.00)
                    .category("Cybersecurity & Information Protection")
                    .capacity(40)
                    .startDate(LocalDate.now().plusDays(15))
                    .endDate(LocalDate.now().plusDays(60))
                    .status("PENDING_APPROVAL")
                    .isActive(false)
                    .trainerId(trainerId)
                    .trainerName(trainerName)
                    .prerequisites("Computer Networking and Linux Fundamentals")
                    .learningObjectives("Implement Zero-Trust networks, conduct penetration audits, secure REST APIs")
                    .targetAudience("Security Engineers and Sysadmins")
                    .build();
            courseRepository.save(pendingCourse);

            // Seed Schedule
            Schedule s1 = Schedule.builder()
                    .courseId(c1.getCourseId())
                    .sessionTitle("Live Lab: Designing RESTful Microservices & JPA")
                    .sessionDate(LocalDate.now().plusDays(6))
                    .startTime(LocalTime.of(10, 0))
                    .endTime(LocalTime.of(12, 0))
                    .location("Innovation Lab 4B")
                    .roomNumber("Lab-402")
                    .maxCapacity(45)
                    .sessionType("PRACTICAL")
                    .build();
            scheduleRepository.save(s1);

            Schedule s2 = Schedule.builder()
                    .courseId(c2.getCourseId())
                    .sessionTitle("Interactive Workshop: High-Performance React Hooks")
                    .sessionDate(LocalDate.now().plusDays(8))
                    .startTime(LocalTime.of(14, 0))
                    .endTime(LocalTime.of(16, 30))
                    .location("Virtual Lecture Hall 1")
                    .roomNumber("Online")
                    .maxCapacity(50)
                    .sessionType("WORKSHOP")
                    .build();
            scheduleRepository.save(s2);

            // Seed Assessment
            Assessment a1 = Assessment.builder()
                    .courseId(c1.getCourseId())
                    .assessmentTitle("Building Secure Authentication Microservice")
                    .assessmentType("PROJECT")
                    .maxScore(100.0)
                    .dueDate(LocalDateTime.now().plusDays(20))
                    .build();
            assessmentRepository.save(a1);
        }
    }
}
