package com.examly.springapp.service;

import com.examly.springapp.model.User;

public interface UserService {

    User register(User user);

    User registerTrainer(com.examly.springapp.dto.TrainerRegistrationRequest request);

    String login(String username, String password);

    com.examly.springapp.dto.LoginResponse authenticateUser(String username, String password);

    User getUserByUsername(String username);
}