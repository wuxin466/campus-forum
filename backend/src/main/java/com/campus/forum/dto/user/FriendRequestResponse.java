package com.campus.forum.dto.user;

import java.time.LocalDateTime;

public record FriendRequestResponse(Long requestId, Long userId, String nickname, String avatarUrl,
                                    String college, int status, LocalDateTime appliedAt) {}
