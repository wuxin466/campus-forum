package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.auth.LoginRequest;
import com.campus.forum.dto.auth.RegisterRequest;
import com.campus.forum.dto.auth.TokenResponse;
import com.campus.forum.dto.auth.RefreshTokenRequest;
import com.campus.forum.dto.auth.ChangePasswordRequest;
import com.campus.forum.dto.user.UserProfileResponse;
import com.campus.forum.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<UserProfileResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        return ApiResponse.success(authService.login(request, servletRequest.getHeader("User-Agent")));
    }

    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request,
                                              HttpServletRequest servletRequest) {
        return ApiResponse.success(authService.refresh(request.refreshToken(), servletRequest.getHeader("User-Agent")));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.refreshToken());
        return ApiResponse.success();
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@AuthenticationPrincipal Jwt jwt,
                                            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(Long.parseLong(jwt.getSubject()), request);
        return ApiResponse.success();
    }

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> me(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(authService.currentUser(Long.parseLong(jwt.getSubject())));
    }
}
