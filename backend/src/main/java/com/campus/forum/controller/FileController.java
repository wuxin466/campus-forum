package com.campus.forum.controller;

import com.campus.forum.common.ApiResponse;
import com.campus.forum.dto.file.FileResponse;
import com.campus.forum.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;

    @PostMapping("/files")
    public ApiResponse<FileResponse> upload(@AuthenticationPrincipal Jwt jwt,
            @RequestParam MultipartFile file,
            @RequestParam(defaultValue = "1") int accessType) {
        return ApiResponse.success(fileService.upload(userId(jwt), file, accessType));
    }

    @GetMapping("/files/{id}")
    public ApiResponse<FileResponse> get(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        return ApiResponse.success(fileService.get(userId(jwt), isAdmin(jwt), id));
    }

    @DeleteMapping("/files/{id}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        fileService.delete(userId(jwt), isAdmin(jwt), id);
        return ApiResponse.success();
    }

    private long userId(Jwt jwt) { return Long.parseLong(jwt.getSubject()); }
    private boolean isAdmin(Jwt jwt) {
        var roles = jwt.getClaimAsStringList("roles");
        return roles != null && (roles.contains("ADMIN") || roles.contains("SUPER_ADMIN"));
    }
}
