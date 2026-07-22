package com.campus.forum.dto.auth;

public record TokenResponse(String accessToken, String refreshToken, String tokenType,
                            long expiresIn, long refreshExpiresIn) {
}
