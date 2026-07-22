package com.campus.forum.dto.news;

import java.time.LocalDateTime;

public record NoticeResponse(Long id, String title, String content, boolean top, LocalDateTime publishedAt) {}
