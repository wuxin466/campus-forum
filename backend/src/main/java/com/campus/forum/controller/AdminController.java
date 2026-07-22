package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.admin.AdminUserResponse;
import com.campus.forum.dto.admin.AuditRequest;
import com.campus.forum.entity.Activity;
import com.campus.forum.entity.Confess;
import com.campus.forum.entity.ForumPost;
import com.campus.forum.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

@Validated
@RestController
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/admin/users")
    public ApiResponse<PageResponse<AdminUserResponse>> users(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        return ApiResponse.success(adminService.users(page, size, keyword, status));
    }

    @PostMapping("/admin/users/{id}/status")
    public ApiResponse<Void> setUserStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable long id,
            @RequestParam @Min(1) @Max(2) int status,
            @RequestParam(required = false) @Size(max = 255) String reason,
            HttpServletRequest request) {
        adminService.setUserStatus(userId(jwt), id, status, reason, clientIp(request));
        return ApiResponse.success();
    }

    @GetMapping("/admin/audits/posts")
    public ApiResponse<PageResponse<ForumPost>> pendingPosts(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long size) {
        return ApiResponse.success(adminService.pendingPosts(page, size));
    }

    @GetMapping("/admin/audits/confesses")
    public ApiResponse<PageResponse<Confess>> pendingConfesses(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long size) {
        return ApiResponse.success(adminService.pendingConfesses(page, size));
    }

    @GetMapping("/admin/audits/activities")
    public ApiResponse<PageResponse<Activity>> pendingActivities(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long size) {
        return ApiResponse.success(adminService.pendingActivities(page, size));
    }

    @PostMapping("/admin/audits/{type}/{id}")
    public ApiResponse<Void> audit(@AuthenticationPrincipal Jwt jwt, @PathVariable String type,
            @PathVariable long id, @Valid @RequestBody AuditRequest body, HttpServletRequest request) {
        adminService.audit(userId(jwt), type, id, body, clientIp(request));
        return ApiResponse.success();
    }

    private long userId(Jwt jwt) { return Long.parseLong(jwt.getSubject()); }
    private String clientIp(HttpServletRequest request) { return request.getRemoteAddr(); }
}
