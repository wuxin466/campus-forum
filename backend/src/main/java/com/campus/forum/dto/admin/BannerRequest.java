package com.campus.forum.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record BannerRequest(
        @NotBlank @Size(max = 100) String title,
        @NotBlank @Size(max = 500) String imageUrl,
        @Size(max = 500) String linkUrl,
        int sortNo,
        @NotNull LocalDateTime startAt,
        @NotNull LocalDateTime endAt) {}
