package com.campus.forum.dto.activity;

import java.time.LocalDateTime;

public record ActivityResponse(
        Long id, Long categoryId, String categoryName, Long creatorId, String creatorName,
        String title, String posterUrl, String content, String location,
        LocalDateTime startAt, LocalDateTime endAt, LocalDateTime signupDeadline,
        int capacity, int signedCount, int views, int status, boolean signed,
        LocalDateTime createdAt) {}
