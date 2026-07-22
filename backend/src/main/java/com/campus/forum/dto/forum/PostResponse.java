package com.campus.forum.dto.forum;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
        Long id, Long authorId, String author, String avatarUrl, String college,
        Long categoryId, String categoryName, String title, String content,
        List<String> imageUrls, List<String> tags, int views, int likes,
        int comments, int collections, boolean top, boolean featured,
        boolean liked, boolean collected, LocalDateTime createdAt) {}
