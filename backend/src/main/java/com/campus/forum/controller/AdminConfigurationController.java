package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.admin.CategoryManageRequest;
import com.campus.forum.dto.admin.SensitiveWordRequest;
import com.campus.forum.entity.ForumCategory;
import com.campus.forum.entity.SensitiveWord;
import com.campus.forum.service.AdminConfigurationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AdminConfigurationController {
    private final AdminConfigurationService service;

    @GetMapping("/admin/categories") public ApiResponse<List<ForumCategory>> categories() { return ApiResponse.success(service.categories()); }
    @PostMapping("/admin/categories") public ApiResponse<Long> createCategory(@Valid @RequestBody CategoryManageRequest body) { return ApiResponse.success(service.saveCategory(null, body)); }
    @PutMapping("/admin/categories/{id}") public ApiResponse<Long> updateCategory(@PathVariable long id, @Valid @RequestBody CategoryManageRequest body) { return ApiResponse.success(service.saveCategory(id, body)); }
    @GetMapping("/admin/sensitive-words") public ApiResponse<List<SensitiveWord>> sensitiveWords() { return ApiResponse.success(service.sensitiveWords()); }
    @PostMapping("/admin/sensitive-words") public ApiResponse<Long> createSensitiveWord(@Valid @RequestBody SensitiveWordRequest body) { return ApiResponse.success(service.saveSensitiveWord(null, body)); }
    @PutMapping("/admin/sensitive-words/{id}") public ApiResponse<Long> updateSensitiveWord(@PathVariable long id, @Valid @RequestBody SensitiveWordRequest body) { return ApiResponse.success(service.saveSensitiveWord(id, body)); }
    @DeleteMapping("/admin/sensitive-words/{id}") public ApiResponse<Void> deleteSensitiveWord(@PathVariable long id) { service.deleteSensitiveWord(id); return ApiResponse.success(); }
}
