package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.activity.ActivityResponse;
import com.campus.forum.dto.activity.CreateActivityRequest;
import com.campus.forum.entity.ActivityCategory;
import com.campus.forum.service.ActivityService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;

    @GetMapping("/public/activities/categories")
    public ApiResponse<List<ActivityCategory>> categories() {
        return ApiResponse.success(activityService.categories());
    }

    @GetMapping("/public/activities")
    public ApiResponse<PageResponse<ActivityResponse>> list(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(activityService.upcoming(page, size, categoryId, keyword, userId(jwt)));
    }

    @GetMapping("/public/activities/{id}")
    public ApiResponse<ActivityResponse> detail(@PathVariable long id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(activityService.detail(id, userId(jwt)));
    }

    @PostMapping("/activities")
    public ApiResponse<ActivityResponse> create(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateActivityRequest request) {
        return ApiResponse.success(activityService.create(requiredUserId(jwt), request));
    }

    @PostMapping("/activities/{id}/sign")
    public ApiResponse<Boolean> toggleSign(@PathVariable long id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(activityService.toggleSign(requiredUserId(jwt), id));
    }

    @GetMapping("/activities/mine")
    public ApiResponse<PageResponse<ActivityResponse>> mine(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size) {
        return ApiResponse.success(activityService.mySigns(requiredUserId(jwt), page, size));
    }

    private Long userId(Jwt jwt) { return jwt == null ? null : Long.parseLong(jwt.getSubject()); }
    private long requiredUserId(Jwt jwt) { return Long.parseLong(jwt.getSubject()); }
}
