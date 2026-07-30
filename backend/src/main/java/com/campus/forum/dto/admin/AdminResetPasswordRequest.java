package com.campus.forum.dto.admin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record AdminResetPasswordRequest(@NotBlank @Size(min=8,max=72) String newPassword) {}
