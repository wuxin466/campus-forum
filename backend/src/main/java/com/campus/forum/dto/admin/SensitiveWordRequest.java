package com.campus.forum.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SensitiveWordRequest(
        @NotBlank @Size(max = 100) String word,
        @Min(1) @Max(2) int level,
        @Min(0) @Max(1) int status) {}
