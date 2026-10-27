package com.examly.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String role;
    private String username;
    private Long id;

    public LoginResponse(String token) {
        this.token = token;
    }
}