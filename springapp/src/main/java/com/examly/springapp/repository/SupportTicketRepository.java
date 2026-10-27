package com.examly.springapp.repository;

import com.examly.springapp.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findAllByOrderByCreatedAtDesc();
    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<SupportTicket> findByStatus(String status);
}
