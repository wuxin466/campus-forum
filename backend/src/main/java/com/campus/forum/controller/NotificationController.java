package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.notification.NotificationResponse;
import com.campus.forum.service.NotificationService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/notifications")
    public ApiResponse<PageResponse<NotificationResponse>> list(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long size) {
        return ApiResponse.success(notificationService.list(userId(jwt), page, size));
    }

    @GetMapping("/notifications/unread-count")
    public ApiResponse<Long> unreadCount(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(notificationService.unreadCount(userId(jwt)));
    }

    @PostMapping("/notifications/{id}/read")
    public ApiResponse<Void> markRead(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        notificationService.markRead(userId(jwt), id);
        return ApiResponse.success();
    }

    @PostMapping("/notifications/read-all")
    public ApiResponse<Void> markAllRead(@AuthenticationPrincipal Jwt jwt) {
        notificationService.markAllRead(userId(jwt));
        return ApiResponse.success();
    }

    private long userId(Jwt jwt) { return Long.parseLong(jwt.getSubject()); }
}
