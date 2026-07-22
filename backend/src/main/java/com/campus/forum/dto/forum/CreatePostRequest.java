package com.campus.forum.dto.forum;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreatePostRequest(
        @NotNull Long categoryId,
        @NotBlank @Size(max = 150) String title,
        @NotBlank String content,
        @Size(max = 9) List<@Size(max = 500) String> imageUrls,
        @Size(max = 5) List<@NotBlank @Size(max = 30) String> tags) {}
