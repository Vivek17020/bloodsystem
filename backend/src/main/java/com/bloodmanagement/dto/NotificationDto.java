package com.bloodmanagement.dto;

import com.bloodmanagement.entity.Notification.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDto {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private LocalDateTime createdAt;
    private Long relatedEntityId;
    private String relatedEntityType;
}
