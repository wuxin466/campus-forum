package com.campus.forum.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryManageRequest(
        @NotBlank @Size(max = 50) String name,
        @NotBlank @Pattern(regexp = "^[a-z0-9_-]{2,50}$") String code,
        @Size(max = 200) String description,
        @Min(0) @Max(9999) int sortNo,
        @Min(0) @Max(1) int status) {}
