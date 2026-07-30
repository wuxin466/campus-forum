package com.campus.forum.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.user.VerificationApplyRequest;
import com.campus.forum.dto.user.VerificationResponse;
import com.campus.forum.entity.CampusVerification;
import com.campus.forum.entity.User;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.CampusVerificationMapper;
import com.campus.forum.mapper.UserMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service @RequiredArgsConstructor
public class VerificationService {
    private final CampusVerificationMapper mapper;
    private final UserMapper userMapper;
    private final NotificationService notificationService;

    @Transactional
    public long apply(long userId, VerificationApplyRequest request) {
        User user = requireUser(userId);
        if (user.getVerifyStatus() == 2) throw BusinessException.badRequest("账号已经完成校园认证");
        if (mapper.selectCount(Wrappers.<CampusVerification>lambdaQuery()
                .eq(CampusVerification::getUserId, userId).eq(CampusVerification::getStatus, 0)) > 0) {
            throw BusinessException.badRequest("已有待审核的认证申请");
        }
        CampusVerification v = new CampusVerification();
        v.setUserId(userId); v.setRealName(request.realName().trim()); v.setStudentNo(request.studentNo().trim());
        v.setCollege(request.college().trim()); v.setCredentialUrl(request.credentialUrl().trim());
        v.setStatus(0); v.setCreatedAt(LocalDateTime.now()); v.setUpdatedAt(LocalDateTime.now());
        mapper.insert(v); user.setVerifyStatus(1); userMapper.updateById(user); return v.getId();
    }

    public VerificationResponse mine(long userId) {
        CampusVerification v = mapper.selectOne(Wrappers.<CampusVerification>lambdaQuery()
                .eq(CampusVerification::getUserId, userId).orderByDesc(CampusVerification::getId).last("LIMIT 1"));
        if (v == null) return null;
        User u = requireUser(userId); return VerificationResponse.from(v, u.getUsername(), u.getNickname());
    }

    public PageResponse<VerificationResponse> list(long page, long size, Integer status) {
        IPage<CampusVerification> result = mapper.selectPage(Page.of(page, size),
                Wrappers.<CampusVerification>lambdaQuery().eq(status != null, CampusVerification::getStatus, status)
                        .orderByAsc(CampusVerification::getStatus).orderByDesc(CampusVerification::getCreatedAt));
        List<Long> ids = result.getRecords().stream().map(CampusVerification::getUserId).distinct().toList();
        Map<Long, User> users = ids.isEmpty() ? Map.of() : userMapper.selectBatchIds(ids).stream().collect(Collectors.toMap(User::getId, u -> u));
        List<VerificationResponse> records = result.getRecords().stream().map(v -> {
            User u = users.get(v.getUserId()); return VerificationResponse.from(v, u == null ? "" : u.getUsername(), u == null ? "" : u.getNickname());
        }).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    @Transactional
    public void audit(long adminId, long id, int status, String reason) {
        CampusVerification v = mapper.selectById(id);
        if (v == null) throw new BusinessException(404, "认证申请不存在");
        if (v.getStatus() != 0) throw BusinessException.badRequest("该申请已经处理");
        if (status == 2 && !StringUtils.hasText(reason)) throw BusinessException.badRequest("驳回时必须填写原因");
        v.setStatus(status); v.setRejectReason(status == 2 ? reason.trim() : null); v.setReviewerId(adminId);
        v.setReviewedAt(LocalDateTime.now()); mapper.updateById(v);
        User user = requireUser(v.getUserId()); user.setVerifyStatus(status == 1 ? 2 : 3);
        if (status == 1) { user.setStudentNo(v.getStudentNo()); user.setCollege(v.getCollege()); }
        userMapper.updateById(user);
        notificationService.create(user.getId(), adminId, 4, status == 1 ? "校园认证已通过" : "校园认证未通过",
                status == 1 ? "你的校园身份已完成认证" : reason, 1, user.getId());
    }
    private User requireUser(long id) { User u=userMapper.selectById(id); if(u==null) throw new BusinessException(404,"用户不存在"); return u; }
}
