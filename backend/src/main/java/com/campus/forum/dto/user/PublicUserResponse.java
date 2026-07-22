package com.campus.forum.dto.user;

import com.campus.forum.entity.User;

public record PublicUserResponse(Long id, String nickname, String avatarUrl, String college,
                                 String grade, String bio, boolean verified, boolean friend) {
    public static PublicUserResponse from(User user, boolean friend) {
        return new PublicUserResponse(user.getId(), user.getNickname(), user.getAvatarUrl(), user.getCollege(),
                user.getGrade(), user.getBio(), user.getVerifyStatus() == 2, friend);
    }
}
