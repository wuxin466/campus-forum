package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.confess.ConfessResponse;
import com.campus.forum.dto.confess.CreateConfessRequest;
import com.campus.forum.dto.forum.CommentResponse;
import com.campus.forum.dto.forum.CreateCommentRequest;
import com.campus.forum.service.ConfessService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequiredArgsConstructor
public class ConfessController {
    private final ConfessService confessService;

    @GetMapping("/public/confesses")
    public ApiResponse<PageResponse<ConfessResponse>> list(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size,
            @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(confessService.list(page, size, userId(jwt)));
    }

    @GetMapping("/public/confesses/{id}")
    public ApiResponse<ConfessResponse> detail(@PathVariable long id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(confessService.detail(id, userId(jwt)));
    }

    @GetMapping("/public/confesses/{id}/comments")
    public ApiResponse<PageResponse<CommentResponse>> comments(@PathVariable long id,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long size) {
        return ApiResponse.success(confessService.comments(id, page, size));
    }

    @PostMapping("/confesses")
    public ApiResponse<ConfessResponse> create(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateConfessRequest request) {
        return ApiResponse.success(confessService.create(requiredUserId(jwt), request));
    }

    @GetMapping("/confesses/mine")
    public ApiResponse<PageResponse<ConfessResponse>> mine(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size) {
        return ApiResponse.success(confessService.mine(requiredUserId(jwt), page, size));
    }

    @DeleteMapping("/confesses/{id}")
    public ApiResponse<Void> delete(@PathVariable long id, @AuthenticationPrincipal Jwt jwt) {
        confessService.delete(requiredUserId(jwt), id);
        return ApiResponse.success();
    }

    @PostMapping("/confesses/{id}/comments")
    public ApiResponse<CommentResponse> comment(@PathVariable long id, @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateCommentRequest request) {
        return ApiResponse.success(confessService.comment(requiredUserId(jwt), id, request));
    }

    @PostMapping("/confesses/{id}/like")
    public ApiResponse<Boolean> like(@PathVariable long id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(confessService.toggleLike(requiredUserId(jwt), id));
    }

    private Long userId(Jwt jwt) { return jwt == null ? null : Long.parseLong(jwt.getSubject()); }
    private long requiredUserId(Jwt jwt) { return Long.parseLong(jwt.getSubject()); }
}
