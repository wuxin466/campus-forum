package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.forum.CommentResponse;
import com.campus.forum.dto.forum.CreateCommentRequest;
import com.campus.forum.dto.forum.CreatePostRequest;
import com.campus.forum.dto.forum.PostResponse;
import com.campus.forum.entity.ForumCategory;
import com.campus.forum.service.ForumService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequiredArgsConstructor
public class ForumController {
    private final ForumService forumService;

    @GetMapping("/public/forum/categories")
    public ApiResponse<List<ForumCategory>> categories() {
        return ApiResponse.success(forumService.categories());
    }

    @GetMapping("/public/forum/posts")
    public ApiResponse<PageResponse<PostResponse>> posts(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "latest") String sort,
            @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(forumService.posts(page, size, categoryId, keyword, sort, userId(jwt)));
    }

    @GetMapping("/public/forum/posts/{id}")
    public ApiResponse<PostResponse> detail(@PathVariable long id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(forumService.detail(id, userId(jwt)));
    }

    @GetMapping("/public/forum/posts/{id}/comments")
    public ApiResponse<PageResponse<CommentResponse>> comments(@PathVariable long id,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long size) {
        return ApiResponse.success(forumService.comments(id, page, size));
    }

    @PostMapping("/forum/posts")
    public ApiResponse<PostResponse> create(@AuthenticationPrincipal Jwt jwt,
                                            @Valid @RequestBody CreatePostRequest request) {
        return ApiResponse.success(forumService.create(requiredUserId(jwt), request));
    }

    @PostMapping("/forum/posts/{id}/comments")
    public ApiResponse<CommentResponse> comment(@PathVariable long id, @AuthenticationPrincipal Jwt jwt,
                                                @Valid @RequestBody CreateCommentRequest request) {
        return ApiResponse.success(forumService.comment(requiredUserId(jwt), id, request));
    }

    @PostMapping("/forum/posts/{id}/like")
    public ApiResponse<Boolean> like(@PathVariable long id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(forumService.toggleLike(requiredUserId(jwt), id));
    }

    @PostMapping("/forum/posts/{id}/collection")
    public ApiResponse<Boolean> collection(@PathVariable long id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(forumService.toggleCollection(requiredUserId(jwt), id));
    }

    @GetMapping("/forum/posts/mine")
    public ApiResponse<PageResponse<PostResponse>> myPosts(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size) {
        return ApiResponse.success(forumService.myPosts(requiredUserId(jwt), page, size));
    }

    @DeleteMapping("/forum/posts/{id}")
    public ApiResponse<Void> deletePost(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        forumService.deletePost(requiredUserId(jwt), id);
        return ApiResponse.success();
    }

    @DeleteMapping("/forum/comments/{id}")
    public ApiResponse<Void> deleteComment(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        forumService.deleteComment(requiredUserId(jwt), id);
        return ApiResponse.success();
    }

    @GetMapping("/forum/comments/mine")
    public ApiResponse<PageResponse<CommentResponse>> myComments(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size) {
        return ApiResponse.success(forumService.myComments(requiredUserId(jwt), page, size));
    }

    @GetMapping("/forum/collections/mine")
    public ApiResponse<PageResponse<PostResponse>> myCollections(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size) {
        return ApiResponse.success(forumService.myCollections(requiredUserId(jwt), page, size));
    }

    private Long userId(Jwt jwt) {
        return jwt == null ? null : Long.parseLong(jwt.getSubject());
    }

    private long requiredUserId(Jwt jwt) {
        return Long.parseLong(jwt.getSubject());
    }
}
