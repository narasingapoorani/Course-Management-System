package com.examly.springapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private com.examly.springapp.repository.TrainerRepository trainerRepository;

    @Override
    public User register(User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        String cleanUsername = user.getUsername().trim();
        user.setUsername(cleanUsername);

        if (userRepository.findByUsername(cleanUsername).isPresent()) {
            throw new RuntimeException("Username '" + cleanUsername + "' is already registered. Please choose another username or sign in.");
        }

        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
            String cleanEmail = user.getEmail().trim();
            user.setEmail(cleanEmail);
            if (userRepository.findByEmail(cleanEmail).isPresent()) {
                throw new RuntimeException("Email '" + cleanEmail + "' is already registered. Please sign in or use another email.");
            }
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("STUDENT");
        } else {
            String r = user.getRole().toUpperCase();
            if ("ADMIN".equals(r) || "TRAINING_MANAGER".equals(r)) {
                user.setRole("STUDENT"); // Prevent self-elevating via public signup
            } else {
                user.setRole(r);
            }
        }

        if (user.getCreatedDate() == null) {
            user.setCreatedDate(java.time.LocalDateTime.now());
        }
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }
        if (user.getEmailVerified() == null) {
            user.setEmailVerified(false);
        }

        User savedUser = userRepository.save(user);

        if ("TRAINER".equalsIgnoreCase(savedUser.getRole())) {
            if (trainerRepository.findByUserId(savedUser.getId()).isEmpty()) {
                com.examly.springapp.model.Trainer trainer = com.examly.springapp.model.Trainer.builder()
                        .userId(savedUser.getId())
                        .professionalName(savedUser.getUsername())
                        .approvalStatus("PENDING")
                        .build();
                trainerRepository.save(trainer);
            }
        }

        return savedUser;
    }

    @Override
    public User registerTrainer(com.examly.springapp.dto.TrainerRegistrationRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        String cleanUsername = request.getUsername().trim();

        if (userRepository.findByUsername(cleanUsername).isPresent()) {
            throw new RuntimeException("Username '" + cleanUsername + "' is already registered. Please choose another username or sign in.");
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String cleanEmail = request.getEmail().trim();
            if (userRepository.findByEmail(cleanEmail).isPresent()) {
                throw new RuntimeException("Email '" + cleanEmail + "' is already registered. Please sign in or use another email.");
            }
        }

        User user = User.builder()
                .username(cleanUsername)
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role("TRAINER")
                .isActive(true)
                .emailVerified(true)
                .createdDate(java.time.LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        com.examly.springapp.model.Trainer trainerProfile = com.examly.springapp.model.Trainer.builder()
                .userId(savedUser.getId())
                .professionalName(request.getProfessionalName() != null && !request.getProfessionalName().isBlank() ? request.getProfessionalName() : savedUser.getUsername())
                .qualifications(request.getQualifications())
                .specializations(request.getSpecializations())
                .yearsExperience(request.getYearsExperience() != null ? request.getYearsExperience() : 1)
                .certifications(request.getCertifications())
                .bio(request.getBio())
                .hourlyRate(request.getHourlyRate() != null ? request.getHourlyRate() : 50.0)
                .licenseOrResumeUrl(request.getLicenseOrResumeUrl())
                .approvalStatus("PENDING")
                .build();

        trainerRepository.save(trainerProfile);

        return savedUser;
    }

    @Override
    public String login(String username, String password) {
        com.examly.springapp.dto.LoginResponse res = authenticateUser(username, password);
        return res.getToken();
    }

    @Override
    public com.examly.springapp.dto.LoginResponse authenticateUser(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid Username"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid Password");
        }

        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername(), user.getRole(), user.getId());
        return new com.examly.springapp.dto.LoginResponse(token, user.getRole(), user.getUsername(), user.getId());
    }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}