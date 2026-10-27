package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.model.Course;

public interface CourseService {

    Course createCourse(Course course);

    Course getCourseById(Long courseId);

    List<Course> getAllCourses();

    List<Course> getCoursesByActive(boolean active);

    Course updateCourse(Long courseId, Course course);

    Course updateCourseStatus(Long courseId, String status, Long reviewerId);

    void deleteCourse(Long courseId);
}