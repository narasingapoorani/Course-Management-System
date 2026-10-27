
package com.examly.springapp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examly.springapp.exception.CourseNotFoundException;
import com.examly.springapp.model.Course;
import com.examly.springapp.repository.CourseRepository;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public Course createCourse(Course course) {
        if (course.getCapacity() <= 0) {
            course.setCapacity(50);
        }
        if (course.getStatus() == null || course.getStatus().trim().isEmpty()) {
            course.setStatus("DRAFT");
        }
        return courseRepository.save(course);
    }

    @Override
    public Course getCourseById(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new CourseNotFoundException("Course not found with id: " + courseId));
    }

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public List<Course> getCoursesByActive(boolean active) {
        return courseRepository.findByIsActive(active);
    }

    @Override
    public Course updateCourse(Long courseId, Course course) {

        Course existingCourse = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new CourseNotFoundException("Course not found with id: " + courseId));

        existingCourse.setTitle(course.getTitle());
        existingCourse.setDescription(course.getDescription());
        existingCourse.setDuration(course.getDuration());
        existingCourse.setLevel(course.getLevel());
        existingCourse.setPrice(course.getPrice());
        existingCourse.setActive(course.isActive());
        if (course.getCapacity() > 0) existingCourse.setCapacity(course.getCapacity());
        if (course.getTrainerId() != null) existingCourse.setTrainerId(course.getTrainerId());
        if (course.getTrainerName() != null) existingCourse.setTrainerName(course.getTrainerName());
        if (course.getStartDate() != null) existingCourse.setStartDate(course.getStartDate());
        if (course.getEndDate() != null) existingCourse.setEndDate(course.getEndDate());
        if (course.getCategory() != null) existingCourse.setCategory(course.getCategory());
        if (course.getStatus() != null) existingCourse.setStatus(course.getStatus());

        return courseRepository.save(existingCourse);
    }

    @Override
    public Course updateCourseStatus(Long courseId, String status, Long reviewerId) {
        Course existingCourse = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new CourseNotFoundException("Course not found with id: " + courseId));

        existingCourse.setStatus(status);
        if ("APPROVED".equalsIgnoreCase(status)) {
            existingCourse.setActive(true);
        } else if ("REJECTED".equalsIgnoreCase(status) || "CANCELLED".equalsIgnoreCase(status)) {
            existingCourse.setActive(false);
        }
        existingCourse.setApprovedBy(reviewerId);
        existingCourse.setApprovalDate(java.time.LocalDateTime.now());

        return courseRepository.save(existingCourse);
    }

    @Override
    public void deleteCourse(Long courseId) {

        Course existingCourse = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new CourseNotFoundException("Course not found with id: " + courseId));

        courseRepository.delete(existingCourse);
    }
}