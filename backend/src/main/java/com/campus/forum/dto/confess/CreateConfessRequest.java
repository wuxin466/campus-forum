package com.campus.forum.dto.confess;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateConfessRequest(
        @NotBlank @Size(max = 5000, message = "表白内容不能超过5000个字符") String content,
        @Size(max = 9) List<@Size(max = 500) String> imageUrls,
        boolean anonymous) {}
