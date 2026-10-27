package com.examly.springapp;

import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.model.Course;
import com.examly.springapp.model.Level;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.CourseRepository;
import com.examly.springapp.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityAndWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String managerToken;
    private String trainerToken;
    private String studentToken;

    @BeforeEach
    void setUp() throws Exception {
        courseRepository.deleteAll();
        userRepository.deleteAll();

        // Create seed users
        userRepository.save(User.builder().username("adminUser").email("admin@test.com").password(passwordEncoder.encode("pass123")).role("ADMIN").build());
        userRepository.save(User.builder().username("managerUser").email("manager@test.com").password(passwordEncoder.encode("pass123")).role("TRAINING_MANAGER").build());
        userRepository.save(User.builder().username("trainerUser").email("trainer@test.com").password(passwordEncoder.encode("pass123")).role("TRAINER").build());
        userRepository.save(User.builder().username("studentUser").email("student@test.com").password(passwordEncoder.encode("pass123")).role("STUDENT").build());

        adminToken = loginAndGetToken("adminUser", "pass123");
        managerToken = loginAndGetToken("managerUser", "pass123");
        trainerToken = loginAndGetToken("trainerUser", "pass123");
        studentToken = loginAndGetToken("studentUser", "pass123");
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        LoginRequest req = new LoginRequest(username, password);
        MvcResult res = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        String body = res.getResponse().getContentAsString();
        return objectMapper.readTree(body).get("token").asText();
    }

    @Test
    void testRegistration_DefaultsToStudent_PreventsAdminSelfElevation() throws Exception {
        User maliciousUser = User.builder()
                .username("hacker")
                .email("hacker@test.com")
                .password("secret")
                .role("ADMIN") // Trying to register as ADMIN
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(maliciousUser)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("STUDENT")); // Overridden to STUDENT
    }

    @Test
    void testAdminOnlyEndpoint_RoleProtection() throws Exception {
        // STUDENT accessing Admin API -> 403 Forbidden
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        // ADMIN accessing Admin API -> 200 OK
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)));
    }

    @Test
    void testCourseApprovalWorkflow() throws Exception {
        // Create course
        Course c = Course.builder()
                .title("Cloud Architecture 101")
                .description("Cloud computing concepts")
                .duration(24)
                .level(Level.ADVANCED)
                .price(199.99)
                .status("PENDING_APPROVAL")
                .isActive(false)
                .build();

        MvcResult createRes = mockMvc.perform(post("/api/courses")
                        .header("Authorization", "Bearer " + trainerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(c)))
                .andExpect(status().isCreated())
                .andReturn();

        long courseId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("courseId").asLong();

        // Manager approves course
        mockMvc.perform(put("/api/courses/" + courseId + "/approve")
                        .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.isActive").value(true));
    }
}
