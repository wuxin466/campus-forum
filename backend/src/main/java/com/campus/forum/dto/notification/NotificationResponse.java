package com.campus.forum.dto.notification;

import java.time.LocalDateTime;

public record NotificationResponse(Long id, int type, Long actorId, String actorName, String actorAvatar,
                                   String title, String content, Integer bizType, Long bizId,
                                   boolean read, LocalDateTime createdAt) {}
