package com.bloodmanagement.service;

import com.bloodmanagement.dto.NotificationDto;
import com.bloodmanagement.entity.Notification;
import com.bloodmanagement.entity.Notification.NotificationType;
import com.bloodmanagement.entity.User;
import com.bloodmanagement.exception.ResourceNotFoundException;
import com.bloodmanagement.repository.NotificationRepository;
import com.bloodmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Notification service — creates and manages user notifications.
 */
@Service
public class NotificationService {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserRepository userRepository;

    public List<NotificationDto> getAllForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
            .map(this::toDto).collect(Collectors.toList());
    }

    public List<NotificationDto> getUnreadForUser(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user).stream()
            .map(this::toDto).collect(Collectors.toList());
    }

    public Map<String, Long> getUnreadCount(User user) {
        return Map.of("count", notificationRepository.countByUserAndIsReadFalse(user));
    }

    @Transactional
    public void markAsRead(Long id, User user) {
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }

    @Transactional
    public Notification createNotification(User user, String title, String message,
                                           NotificationType type, Long entityId, String entityType) {
        Notification n = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(type)
            .isRead(false)
            .relatedEntityId(entityId)
            .relatedEntityType(entityType)
            .build();
        return notificationRepository.save(n);
    }

    /** Notify all admins and blood bank users about critical events. */
    @Transactional
    public void notifyAdminsAndBloodBanks(String title, String message) {
        userRepository.findAll().stream()
            .filter(u -> u.getRole() == User.Role.ADMIN || u.getRole() == User.Role.BLOOD_BANK)
            .forEach(u -> createNotification(u, title, message, NotificationType.CRITICAL, null, null));
    }

    private NotificationDto toDto(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setUserId(n.getUser().getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        dto.setRelatedEntityId(n.getRelatedEntityId());
        dto.setRelatedEntityType(n.getRelatedEntityType());
        return dto;
    }
}
