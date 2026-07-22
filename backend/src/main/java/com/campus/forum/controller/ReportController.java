package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.report.CreateReportRequest;
import com.campus.forum.dto.report.HandleReportRequest;
import com.campus.forum.dto.report.ReportResponse;
import com.campus.forum.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class ReportController {
    private final ReportService reportService;

    @PostMapping("/reports")
    public ApiResponse<ReportResponse> create(@AuthenticationPrincipal Jwt jwt,
                                              @Valid @RequestBody CreateReportRequest request) {
        return ApiResponse.success(reportService.create(userId(jwt), request));
    }

    @GetMapping("/reports/mine")
    public ApiResponse<PageResponse<ReportResponse>> mine(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long size) {
        return ApiResponse.success(reportService.mine(userId(jwt), page, size));
    }

    @GetMapping("/admin/reports")
    public ApiResponse<PageResponse<ReportResponse>> adminList(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long size,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer bizType) {
        return ApiResponse.success(reportService.adminList(page, size, status, bizType));
    }

    @PostMapping("/admin/reports/{id}/handle")
    public ApiResponse<Void> handle(@AuthenticationPrincipal Jwt jwt, @PathVariable long id,
            @Valid @RequestBody HandleReportRequest request, HttpServletRequest servletRequest) {
        reportService.handle(userId(jwt), id, request, servletRequest.getRemoteAddr());
        return ApiResponse.success();
    }

    private long userId(Jwt jwt) { return Long.parseLong(jwt.getSubject()); }
}
