package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.home.HomeResponse;
import com.campus.forum.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HomeController {
    private final HomeService homeService;

    @GetMapping("/public/home")
    public ApiResponse<HomeResponse> home(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(homeService.home(jwt == null ? null : Long.parseLong(jwt.getSubject())));
    }
}
