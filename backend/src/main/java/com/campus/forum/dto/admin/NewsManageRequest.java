package com.campus.forum.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NewsManageRequest(
        @NotBlank @Size(max = 150) String title,
        @Size(max = 500) String summary,
        @NotBlank String content,
        @Size(max = 500) String coverUrl,
        @Size(max = 100) String source,
        boolean top) {}
