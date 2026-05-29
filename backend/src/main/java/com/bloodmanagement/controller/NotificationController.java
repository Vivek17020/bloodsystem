package com.bloodmanagement.controller;

import com.bloodmanagement.dto.NotificationDto;
import com.bloodmanagement.service.AuthService;
import com.bloodmanagement.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Notification REST controller.
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired private NotificationService notificationService;
    @Autowired private AuthService authService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getAll() {
        return ResponseEntity.ok(notificationService.getAllForUser(authService.getCurrentUser()));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDto>> getUnread() {
        return ResponseEntity.ok(notificationService.getUnreadForUser(authService.getCurrentUser()));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(notificationService.getUnreadCount(authService.getCurrentUser()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id, authService.getCurrentUser());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead(authService.getCurrentUser());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
