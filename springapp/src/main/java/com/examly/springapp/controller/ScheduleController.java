package com.examly.springapp.controller;

import com.examly.springapp.model.Schedule;
import com.examly.springapp.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @GetMapping
    public ResponseEntity<List<Schedule>> getAllSchedules() {
        return ResponseEntity.ok(scheduleRepository.findAll());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Schedule>> getCourseSchedule(@PathVariable Long courseId) {
        return ResponseEntity.ok(scheduleRepository.findByCourseId(courseId));
    }

    @PostMapping
    public ResponseEntity<Schedule> createSchedule(@RequestBody Schedule schedule) {
        Schedule saved = scheduleRepository.save(schedule);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}
