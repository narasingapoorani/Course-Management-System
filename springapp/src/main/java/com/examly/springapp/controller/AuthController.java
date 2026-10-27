package com.examly.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.LoginResponse;
import com.examly.springapp.model.User;
import com.examly.springapp.service.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {

        User savedUser = userService.register(user);

        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    @PostMapping("/register-trainer")
    public ResponseEntity<User> registerTrainer(@RequestBody com.examly.springapp.dto.TrainerRegistrationRequest request) {
        User savedUser = userService.registerTrainer(request);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        LoginResponse response = userService.authenticateUser(request.getUsername(), request.getPassword());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(org.springframework.security.core.Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(userService.getUserByUsername(auth.getName()));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(org.springframework.security.core.Authentication auth) {
        return getProfile(auth);
    }
}