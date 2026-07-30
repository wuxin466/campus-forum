package com.campus.forum.dto.user;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record VerificationApplyRequest(@NotBlank @Size(max=50) String realName,
        @NotBlank @Size(max=50) String studentNo,
        @NotBlank @Size(max=100) String college,
        @NotBlank @Size(max=500) String credentialUrl) {}
