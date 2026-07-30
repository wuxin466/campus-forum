package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.search.SearchResponse;
import com.campus.forum.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;

@RestController
@RequiredArgsConstructor
@Validated
public class SearchController {
    private final SearchService searchService;

    @GetMapping("/public/search")
    public ApiResponse<SearchResponse> search(@RequestParam(name = "keyword", defaultValue = "") String keyword,
                                              @RequestParam(defaultValue="1") @Min(1) long page,
                                              @RequestParam(defaultValue="10") @Min(1) @Max(50) long size,
                                              @AuthenticationPrincipal Jwt jwt) {
        Long currentUserId = jwt == null ? null : Long.parseLong(jwt.getSubject());
        return ApiResponse.success(searchService.search(keyword, page, size, currentUserId));
    }
}
