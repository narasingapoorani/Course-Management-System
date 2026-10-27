package com.examly.springapp.controller;

import com.examly.springapp.model.Course;
import com.examly.springapp.model.Level;
import com.examly.springapp.repository.CourseRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Optional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class CourseControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Course sampleCourse;

    @BeforeEach
    void setUp() {
        courseRepository.deleteAll();
        sampleCourse = Course.builder()
                .title("Spring Boot Fundamentals")
                .description("Learn the basics of Spring Boot framework")
                .duration(20)
                .level(Level.BEGINNER)
                .price(99.99)
                .isActive(true)
                .build();
        sampleCourse = courseRepository.save(sampleCourse);
    }

    @AfterEach
    void tearDown() {
        courseRepository.deleteAll();
    }

    @Test
    void controller_createCourseTest_success() throws Exception {
        Course course = Course.builder()
                .title("Advanced React Patterns")
                .description("Master advanced React patterns and techniques")
                .duration(15)
                .level(Level.ADVANCED)
                .price(149.99)
                .isActive(true)
                .build();
        mockMvc.perform(post("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(course)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Advanced React Patterns"))
                .andExpect(jsonPath("$.courseId").exists());
    }

    @Test
    void controller_createCourseTest_validationFailure() throws Exception {
        Course course = Course.builder()
                .title("")
                .duration(0)
                .level(null)
                .price(-1.0)
                .isActive(true)
                .build();
        mockMvc.perform(post("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(course)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Title must not be empty")))
                .andExpect(jsonPath("$.message", containsString("Duration must be at least 1 hour")))
                .andExpect(jsonPath("$.message", containsString("Level is required")))
                .andExpect(jsonPath("$.message", containsString("Price must not be negative")));
    }

    @Test
    void controller_getCourseTest_success() throws Exception {
        mockMvc.perform(get("/api/courses/{id}", sampleCourse.getCourseId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseId").value(sampleCourse.getCourseId()))
                .andExpect(jsonPath("$.title").value("Spring Boot Fundamentals"));
    }

    @Test
    void controller_getCourseTest_notFound() throws Exception {
        mockMvc.perform(get("/api/courses/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", is("Course not found with id: 999")));
    }

    @Test
    void controller_getAllCoursesTest() throws Exception {
        Course active = Course.builder()
                .title("Active Course")
                .duration(5)
                .level(Level.BEGINNER)
                .price(44.0)
                .isActive(true)
                .build();
        courseRepository.save(active);
        Course inactive = Course.builder()
                .title("Inactive Course")
                .duration(6)
                .level(Level.ADVANCED)
                .price(55.5)
                .isActive(false)
                .build();
        courseRepository.save(inactive);
        // All
        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
        // Active
        mockMvc.perform(get("/api/courses?active=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", everyItem(hasEntry("isActive", true))));
        // Inactive
        mockMvc.perform(get("/api/courses?active=false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", everyItem(hasEntry("isActive", false))));
    }

    @Test
    void controller_updateCourseTest_success() throws Exception {
        Course updated = Course.builder()
                .title("Updated Title")
                .description("Updated Desc")
                .duration(8)
                .level(Level.INTERMEDIATE)
                .price(120.0)
                .isActive(false)
                .build();
        mockMvc.perform(put("/api/courses/{id}", sampleCourse.getCourseId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    void controller_updateCourseTest_validationFailure() throws Exception {
        Course updated = Course.builder()
                .title("")
                .duration(0)
                .level(null)
                .price(-1.0)
                .isActive(true)
                .build();
        mockMvc.perform(put("/api/courses/{id}", sampleCourse.getCourseId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Title must not be empty")))
                .andExpect(jsonPath("$.message", containsString("Duration must be at least 1 hour")))
                .andExpect(jsonPath("$.message", containsString("Level is required")))
                .andExpect(jsonPath("$.message", containsString("Price must not be negative")));
    }

    @Test
    void controller_updateCourseTest_notFound() throws Exception {
        Course updated = Course.builder()
                .title("Doesn't matter")
                .duration(10)
                .level(Level.BEGINNER)
                .price(100.0)
                .isActive(true)
                .build();
        mockMvc.perform(put("/api/courses/{id}", 999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", is("Course not found with id: 999")));
    }

    @Test
    void controller_deleteCourseTest_success() throws Exception {
        mockMvc.perform(delete("/api/courses/{id}", sampleCourse.getCourseId()))
                .andExpect(status().isNoContent());
        // Verify delete
        Optional<Course> deleted = courseRepository.findById(sampleCourse.getCourseId());
        assert(deleted.isEmpty());
    }

    @Test
    void controller_deleteCourseTest_notFound() throws Exception {
        mockMvc.perform(delete("/api/courses/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", is("Course not found with id: 999")));
    }
}
