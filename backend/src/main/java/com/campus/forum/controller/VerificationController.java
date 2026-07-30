package com.campus.forum.controller;
import com.campus.forum.common.ApiResponse;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.admin.VerificationAuditRequest;
import com.campus.forum.dto.user.VerificationApplyRequest;
import com.campus.forum.dto.user.VerificationResponse;
import com.campus.forum.service.VerificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController @RequiredArgsConstructor
public class VerificationController {
    private final VerificationService service;
    @PostMapping("/verifications") public ApiResponse<Long> apply(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody VerificationApplyRequest body) { return ApiResponse.success(service.apply(id(jwt), body)); }
    @GetMapping("/verifications/mine") public ApiResponse<VerificationResponse> mine(@AuthenticationPrincipal Jwt jwt) { return ApiResponse.success(service.mine(id(jwt))); }
    @GetMapping("/admin/verifications") public ApiResponse<PageResponse<VerificationResponse>> list(@RequestParam(defaultValue="1") @Min(1) long page, @RequestParam(defaultValue="20") @Min(1) @Max(100) long size, @RequestParam(required=false) Integer status) { return ApiResponse.success(service.list(page,size,status)); }
    @PostMapping("/admin/verifications/{verificationId}/audit") public ApiResponse<Void> audit(@AuthenticationPrincipal Jwt jwt, @PathVariable long verificationId, @Valid @RequestBody VerificationAuditRequest body) { service.audit(id(jwt),verificationId,body.status(),body.reason()); return ApiResponse.success(); }
    private long id(Jwt jwt){return Long.parseLong(jwt.getSubject());}
}
