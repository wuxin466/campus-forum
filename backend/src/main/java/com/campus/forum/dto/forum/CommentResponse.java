package com.campus.forum.dto.forum;

import java.time.LocalDateTime;

public record CommentResponse(Long id, Integer bizType, Long bizId, Long parentId, Long rootId, Long userId, String nickname,
                              String avatarUrl, Long replyUserId, String content, int likes,
                              LocalDateTime createdAt) {}
