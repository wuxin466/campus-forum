package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.news.NewsResponse;
import com.campus.forum.dto.news.NoticeResponse;
import com.campus.forum.service.NewsService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;

    @GetMapping("/public/news")
    public ApiResponse<PageResponse<NewsResponse>> news(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.success(newsService.news(page, size, keyword));
    }

    @GetMapping("/public/news/{id}")
    public ApiResponse<NewsResponse> detail(@PathVariable long id) {
        return ApiResponse.success(newsService.detail(id));
    }

    @GetMapping("/public/notices")
    public ApiResponse<PageResponse<NoticeResponse>> notices(
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) long size) {
        return ApiResponse.success(newsService.notices(page, size));
    }
}
