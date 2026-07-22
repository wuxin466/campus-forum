package com.campus.forum.dto.confess;

import java.time.LocalDateTime;
import java.util.List;

public record ConfessResponse(
        Long id, Long authorId, String author, String avatarUrl, String content,
        List<String> imageUrls, boolean anonymous, int likes, int comments,
        boolean liked, int auditStatus, String auditReason, LocalDateTime createdAt) {}
