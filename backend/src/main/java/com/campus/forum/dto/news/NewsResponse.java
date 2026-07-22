package com.campus.forum.dto.news;

import java.time.LocalDateTime;

public record NewsResponse(Long id, String title, String summary, String content, String coverUrl,
                           String source, int views, boolean top, LocalDateTime publishedAt) {}
