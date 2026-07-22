package com.campus.forum.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Pattern(regexp = "^[A-Za-z0-9_]{4,50}$", message = "账号须为4-50位字母、数字或下划线") String username,
        @NotBlank @Size(min = 8, max = 72, message = "密码长度须为8-72位") String password,
        @NotBlank @Size(max = 40, message = "昵称不能超过40个字符") String nickname,
        @Size(max = 100, message = "学院不能超过100个字符") String college,
        @Size(max = 20, message = "年级不能超过20个字符") String grade) {
}
