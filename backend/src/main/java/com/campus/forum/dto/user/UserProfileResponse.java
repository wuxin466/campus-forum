package com.campus.forum.dto.user;

import com.campus.forum.entity.User;

public record UserProfileResponse(Long id, String username, String nickname, String avatarUrl,
                                  String college, String grade, String bio, Integer verifyStatus) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(user.getId(), user.getUsername(), user.getNickname(),
                user.getAvatarUrl(), user.getCollege(), user.getGrade(), user.getBio(), user.getVerifyStatus());
    }
}
