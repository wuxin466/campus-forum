package com.campus.forum.dto.user;
import com.campus.forum.entity.CampusVerification;
import java.time.LocalDateTime;
public record VerificationResponse(Long id, Long userId, String username, String nickname,
        String realName, String studentNo, String college, String credentialUrl,
        Integer status, String rejectReason, LocalDateTime createdAt, LocalDateTime reviewedAt) {
    public static VerificationResponse from(CampusVerification v, String username, String nickname) {
        return new VerificationResponse(v.getId(), v.getUserId(), username, nickname, v.getRealName(),
                v.getStudentNo(), v.getCollege(), v.getCredentialUrl(), v.getStatus(), v.getRejectReason(),
                v.getCreatedAt(), v.getReviewedAt());
    }
}
