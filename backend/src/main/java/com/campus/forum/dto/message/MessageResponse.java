package com.campus.forum.dto.message;

import java.time.LocalDateTime;

public record MessageResponse(Long id, Long senderId, Long receiverId, int messageType,
                              String content, String fileUrl, boolean read,
                              LocalDateTime readAt, LocalDateTime createdAt) {}
