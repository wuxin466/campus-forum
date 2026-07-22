package com.campus.forum.dto.news;

import java.time.LocalDateTime;

public record BannerResponse(Long id, String title, String imageUrl, String linkUrl,
                             int sortNo, LocalDateTime startAt, LocalDateTime endAt) {}
