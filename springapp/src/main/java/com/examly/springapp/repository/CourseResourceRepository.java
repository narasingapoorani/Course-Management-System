package com.examly.springapp.repository;

import com.examly.springapp.model.CourseResource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseResourceRepository extends JpaRepository<CourseResource, Long> {
    List<CourseResource> findByCourseId(Long courseId);
    List<CourseResource> findByUploadedBy(Long uploadedBy);
}
