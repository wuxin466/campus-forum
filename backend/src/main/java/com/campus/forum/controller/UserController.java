package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.confess.ConfessResponse;
import com.campus.forum.dto.forum.PostResponse;
import com.campus.forum.dto.user.FriendRequestResponse;
import com.campus.forum.dto.user.PublicUserResponse;
import com.campus.forum.dto.user.UpdateProfileRequest;
import com.campus.forum.dto.user.UserProfileResponse;
import com.campus.forum.service.FriendService;
import com.campus.forum.service.ConfessService;
import com.campus.forum.service.ForumService;
import com.campus.forum.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final FriendService friendService;
    private final ForumService forumService;
    private final ConfessService confessService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> me(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(userService.me(userId(jwt)));
    }

    @PutMapping("/me")
    public ApiResponse<UserProfileResponse> update(@AuthenticationPrincipal Jwt jwt,
                                                   @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(userService.update(userId(jwt), request));
    }

    @GetMapping("/{id}")
    public ApiResponse<PublicUserResponse> profile(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        return ApiResponse.success(userService.profile(userId(jwt), id));
    }

    @GetMapping("/{id}/posts")
    public ApiResponse<PageResponse<PostResponse>> posts(@AuthenticationPrincipal Jwt jwt, @PathVariable long id,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long size) {
        return ApiResponse.success(forumService.publicPosts(id, page, size, userId(jwt)));
    }

    @GetMapping("/{id}/confesses")
    public ApiResponse<PageResponse<ConfessResponse>> confesses(@AuthenticationPrincipal Jwt jwt, @PathVariable long id,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long size) {
        return ApiResponse.success(confessService.publicConfesses(id, page, size, userId(jwt)));
    }

    @GetMapping("/search")
    public ApiResponse<List<PublicUserResponse>> search(@AuthenticationPrincipal Jwt jwt,
            @RequestParam @Size(min = 1, max = 40) String keyword) {
        return ApiResponse.success(userService.search(userId(jwt), keyword));
    }

    @PostMapping("/friends/{targetUserId}")
    public ApiResponse<Long> apply(@AuthenticationPrincipal Jwt jwt, @PathVariable long targetUserId) {
        return ApiResponse.success(friendService.apply(userId(jwt), targetUserId));
    }

    @GetMapping("/friend-requests")
    public ApiResponse<List<FriendRequestResponse>> requests(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(friendService.pendingRequests(userId(jwt)));
    }

    @PostMapping("/friend-requests/{requestId}/accept")
    public ApiResponse<Void> accept(@AuthenticationPrincipal Jwt jwt, @PathVariable long requestId) {
        friendService.handle(userId(jwt), requestId, true);
        return ApiResponse.success();
    }

    @PostMapping("/friend-requests/{requestId}/reject")
    public ApiResponse<Void> reject(@AuthenticationPrincipal Jwt jwt, @PathVariable long requestId) {
        friendService.handle(userId(jwt), requestId, false);
        return ApiResponse.success();
    }

    @GetMapping("/friends")
    public ApiResponse<List<PublicUserResponse>> friends(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(friendService.friends(userId(jwt)));
    }

    @DeleteMapping("/friends/{friendId}")
    public ApiResponse<Void> remove(@AuthenticationPrincipal Jwt jwt, @PathVariable long friendId) {
        friendService.remove(userId(jwt), friendId);
        return ApiResponse.success();
    }

    private long userId(Jwt jwt) {
        return Long.parseLong(jwt.getSubject());
    }
}
