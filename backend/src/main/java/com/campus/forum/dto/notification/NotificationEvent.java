package com.campus.forum.dto.notification;
import java.io.Serializable;
public record NotificationEvent(long receiverId, Long actorId, int type, String title,
        String content, Integer bizType, Long bizId) implements Serializable {}
