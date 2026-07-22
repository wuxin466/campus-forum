package com.campus.forum.dto.forum;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(Long parentId, @NotBlank @Size(max = 1000) String content) {}
