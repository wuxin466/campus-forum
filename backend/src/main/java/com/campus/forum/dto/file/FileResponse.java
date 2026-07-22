package com.campus.forum.dto.file;

import java.time.LocalDateTime;

public record FileResponse(Long id, String originalName, String contentType, long fileSize,
                           String sha256, int accessType, String url, int urlExpiresIn,
                           LocalDateTime createdAt) {}
