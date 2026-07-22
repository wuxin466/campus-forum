package com.campus.forum.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NoticeManageRequest(
        @NotBlank @Size(max = 150) String title,
        @NotBlank String content,
        @Min(0) @Max(2) int targetType,
        boolean top) {}
