package com.campus.forum.dto.admin;

import com.campus.forum.entity.User;
import java.time.LocalDateTime;

public record AdminUserResponse(Long id, String username, String nickname, String avatarUrl,
                                String college, String grade, int role, int verifyStatus,
                                int status, LocalDateTime createdAt, LocalDateTime lastLoginAt) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(user.getId(), user.getUsername(), user.getNickname(), user.getAvatarUrl(),
                user.getCollege(), user.getGrade(), user.getRole(), user.getVerifyStatus(), user.getStatus(),
                user.getCreatedAt(), user.getLastLoginAt());
    }
}
