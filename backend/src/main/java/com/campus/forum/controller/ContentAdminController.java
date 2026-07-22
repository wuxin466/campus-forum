package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.admin.BannerRequest;
import com.campus.forum.dto.admin.NewsManageRequest;
import com.campus.forum.dto.admin.NoticeManageRequest;
import com.campus.forum.dto.news.BannerResponse;
import com.campus.forum.service.ContentAdminService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ContentAdminController {
    private final ContentAdminService service;

    @GetMapping("/public/banners")
    public ApiResponse<List<BannerResponse>> banners() { return ApiResponse.success(service.activeBanners()); }

    @PostMapping("/admin/news")
    public ApiResponse<Long> createNews(@AuthenticationPrincipal Jwt jwt,
                                        @Valid @RequestBody NewsManageRequest request) {
        return ApiResponse.success(service.createNews(Long.parseLong(jwt.getSubject()), request));
    }

    @PutMapping("/admin/news/{id}")
    public ApiResponse<Void> updateNews(@PathVariable long id, @Valid @RequestBody NewsManageRequest request) {
        service.updateNews(id, request); return ApiResponse.success();
    }

    @PostMapping("/admin/news/{id}/publish")
    public ApiResponse<Void> publishNews(@PathVariable long id) { service.setNewsPublished(id, true); return ApiResponse.success(); }

    @PostMapping("/admin/news/{id}/unpublish")
    public ApiResponse<Void> unpublishNews(@PathVariable long id) { service.setNewsPublished(id, false); return ApiResponse.success(); }

    @PostMapping("/admin/notices")
    public ApiResponse<Long> createNotice(@AuthenticationPrincipal Jwt jwt,
                                          @Valid @RequestBody NoticeManageRequest request) {
        return ApiResponse.success(service.createNotice(Long.parseLong(jwt.getSubject()), request));
    }

    @PutMapping("/admin/notices/{id}")
    public ApiResponse<Void> updateNotice(@PathVariable long id, @Valid @RequestBody NoticeManageRequest request) {
        service.updateNotice(id, request); return ApiResponse.success();
    }

    @PostMapping("/admin/notices/{id}/publish")
    public ApiResponse<Void> publishNotice(@PathVariable long id) { service.setNoticePublished(id, true); return ApiResponse.success(); }

    @PostMapping("/admin/notices/{id}/unpublish")
    public ApiResponse<Void> unpublishNotice(@PathVariable long id) { service.setNoticePublished(id, false); return ApiResponse.success(); }

    @PostMapping("/admin/banners")
    public ApiResponse<Long> createBanner(@Valid @RequestBody BannerRequest request) {
        return ApiResponse.success(service.createBanner(request));
    }

    @PutMapping("/admin/banners/{id}")
    public ApiResponse<Void> updateBanner(@PathVariable long id, @Valid @RequestBody BannerRequest request) {
        service.updateBanner(id, request); return ApiResponse.success();
    }

    @DeleteMapping("/admin/banners/{id}")
    public ApiResponse<Void> deleteBanner(@PathVariable long id) {
        service.deleteBanner(id); return ApiResponse.success();
    }
}
