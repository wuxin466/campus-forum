package com.campus.forum.dto.message;

import java.time.LocalDateTime;

public record ConversationResponse(Long userId, String nickname, String avatarUrl,
                                   String lastMessage, int lastMessageType,
                                   LocalDateTime lastMessageAt, long unreadCount) {}
