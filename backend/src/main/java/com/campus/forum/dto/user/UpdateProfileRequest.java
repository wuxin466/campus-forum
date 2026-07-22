package com.campus.forum.dto.user;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 1, max = 40, message = "昵称长度须为1-40个字符") String nickname,
        @Size(max = 500, message = "头像地址不能超过500个字符") String avatarUrl,
        @Size(max = 100, message = "学院不能超过100个字符") String college,
        @Size(max = 20, message = "年级不能超过20个字符") String grade,
        @Size(max = 300, message = "简介不能超过300个字符") String bio) {}
