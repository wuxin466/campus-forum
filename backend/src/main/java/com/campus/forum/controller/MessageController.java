package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.message.ConversationResponse;
import com.campus.forum.dto.message.MessageResponse;
import com.campus.forum.dto.message.SendMessageRequest;
import com.campus.forum.service.MessageService;
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
public class MessageController {
    private final MessageService messageService;

    @PostMapping("/messages/{receiverId}")
    public ApiResponse<MessageResponse> send(@AuthenticationPrincipal Jwt jwt, @PathVariable long receiverId,
                                             @Valid @RequestBody SendMessageRequest request) {
        return ApiResponse.success(messageService.send(userId(jwt), receiverId, request));
    }

    @GetMapping("/messages/conversations")
    public ApiResponse<List<ConversationResponse>> conversations(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(messageService.conversations(userId(jwt)));
    }

    @GetMapping("/messages/with/{otherId}")
    public ApiResponse<PageResponse<MessageResponse>> history(@AuthenticationPrincipal Jwt jwt,
            @PathVariable long otherId,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "30") @Min(1) @Max(100) long size) {
        return ApiResponse.success(messageService.history(userId(jwt), otherId, page, size));
    }

    @GetMapping("/messages/unread-count")
    public ApiResponse<Long> unreadCount(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(messageService.unreadCount(userId(jwt)));
    }

    @PostMapping("/messages/with/{otherId}/read")
    public ApiResponse<Void> markRead(@AuthenticationPrincipal Jwt jwt, @PathVariable long otherId) {
        messageService.markRead(userId(jwt), otherId);
        return ApiResponse.success();
    }

    private long userId(Jwt jwt) { return Long.parseLong(jwt.getSubject()); }
}
