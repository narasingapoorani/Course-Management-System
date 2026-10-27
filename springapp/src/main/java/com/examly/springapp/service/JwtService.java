package com.examly.springapp.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET =
            "mysecretkeymysecretkeymysecretkey123456";

    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    // Generate JWT Token
    public String generateToken(String username) {
        return generateToken(username, "STUDENT", null);
    }

    public String generateToken(String username, String role, Long userId) {
        var builder = Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(key, SignatureAlgorithm.HS256);

        if (userId != null) {
            builder.claim("userId", userId);
        }

        return builder.compact();
    }

    public String extractRole(String token) {
        Object role = extractClaims(token).get("role");
        return role != null ? role.toString() : null;
    }

    public Long extractUserId(String token) {
        Object userId = extractClaims(token).get("userId");
        if (userId instanceof Number) {
            return ((Number) userId).longValue();
        }
        return null;
    }

    // Extract Username
    public String extractUsername(String token) {

        return extractClaims(token).getSubject();
    }

    // Validate Token
    public boolean validateToken(String token, String username) {

        return extractUsername(token).equals(username)
                && !extractClaims(token).getExpiration().before(new Date());
    }

    private Claims extractClaims(String token) {

        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}