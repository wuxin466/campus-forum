package com.campus.forum.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.admin.AdminUserResponse;
import com.campus.forum.dto.admin.AdminOverviewResponse;
import com.campus.forum.dto.admin.AuditRequest;
import com.campus.forum.entity.Activity;
import com.campus.forum.entity.AdminAuditLog;
import com.campus.forum.entity.Confess;
import com.campus.forum.entity.ForumPost;
import com.campus.forum.entity.Report;
import com.campus.forum.entity.User;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.ActivityMapper;
import com.campus.forum.mapper.AdminAuditLogMapper;
import com.campus.forum.mapper.ConfessMapper;
import com.campus.forum.mapper.ForumPostMapper;
import com.campus.forum.mapper.ReportMapper;
import com.campus.forum.mapper.UserMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserMapper userMapper;
    private final ForumPostMapper postMapper;
    private final ConfessMapper confessMapper;
    private final ActivityMapper activityMapper;
    private final AdminAuditLogMapper auditLogMapper;
    private final ReportMapper reportMapper;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    public AdminOverviewResponse overview() {
        long totalUsers = userMapper.selectCount(Wrappers.lambdaQuery());
        long activeUsers = userMapper.selectCount(Wrappers.<User>lambdaQuery().eq(User::getStatus, 1));
        long bannedUsers = userMapper.selectCount(Wrappers.<User>lambdaQuery().eq(User::getStatus, 2));
        long publishedPosts = postMapper.selectCount(Wrappers.<ForumPost>lambdaQuery()
                .eq(ForumPost::getAuditStatus, 1).eq(ForumPost::getStatus, 1));
        long pendingPosts = postMapper.selectCount(Wrappers.<ForumPost>lambdaQuery().eq(ForumPost::getAuditStatus, 0));
        long pendingConfesses = confessMapper.selectCount(Wrappers.<Confess>lambdaQuery().eq(Confess::getAuditStatus, 0));
        long pendingActivities = activityMapper.selectCount(Wrappers.<Activity>lambdaQuery().eq(Activity::getAuditStatus, 0));
        long pendingReports = reportMapper.selectCount(Wrappers.<Report>lambdaQuery().lt(Report::getStatus, 2));
        return new AdminOverviewResponse(totalUsers, activeUsers, bannedUsers, publishedPosts,
                pendingPosts, pendingConfesses, pendingActivities, pendingReports);
    }

    public PageResponse<AdminUserResponse> users(long page, long size, String keyword, Integer status) {
        IPage<User> result = userMapper.selectPage(Page.of(page, size),
                Wrappers.<User>lambdaQuery().eq(status != null, User::getStatus, status)
                        .and(StringUtils.hasText(keyword), query -> query.like(User::getUsername, keyword)
                                .or().like(User::getNickname, keyword).or().like(User::getCollege, keyword))
                        .orderByDesc(User::getCreatedAt));
        List<AdminUserResponse> records = result.getRecords().stream().map(AdminUserResponse::from).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    @Transactional
    public void setUserStatus(long adminId, long userId, int status, String reason, String ip) {
        if (adminId == userId) throw BusinessException.badRequest("不能修改自己的账号状态");
        if (status != 1 && status != 2) throw BusinessException.badRequest("用户状态只能为正常或封禁");
        User user = userMapper.selectById(userId);
        if (user == null) throw new BusinessException(404, "用户不存在");
        User admin = userMapper.selectById(adminId);
        if (user.getRole() >= admin.getRole() && admin.getRole() < 2) {
            throw new BusinessException(403, "不能操作同级或更高权限账号");
        }
        user.setStatus(status);
        userMapper.updateById(user);
        notificationService.create(userId, null, 5, status == 2 ? "账号已被封禁" : "账号已恢复",
                reason, 1, userId);
        log(adminId, status == 2 ? "BAN_USER" : "UNBAN_USER", "USER", userId, reason, ip);
    }

    public PageResponse<ForumPost> pendingPosts(long page, long size) {
        IPage<ForumPost> result = postMapper.selectPage(Page.of(page, size),
                Wrappers.<ForumPost>lambdaQuery().eq(ForumPost::getAuditStatus, 0)
                        .orderByAsc(ForumPost::getCreatedAt));
        return PageResponse.from(result);
    }

    public PageResponse<ForumPost> publishedPosts(long page, long size) {
        IPage<ForumPost> result = postMapper.selectPage(Page.of(page, size),
                Wrappers.<ForumPost>lambdaQuery().eq(ForumPost::getAuditStatus, 1)
                        .in(ForumPost::getStatus, 1, 2).orderByDesc(ForumPost::getCreatedAt));
        return PageResponse.from(result);
    }

    @Transactional
    public void downPost(long adminId, long postId, String reason, String ip) {
        ForumPost post = postMapper.selectById(postId);
        if (post == null || post.getAuditStatus() != 1 || post.getStatus() != 1) {
            throw new BusinessException(404, "已发布帖子不存在");
        }
        String detail = StringUtils.hasText(reason) ? reason.trim() : "管理员下架";
        post.setStatus(2); post.setAuditReason(detail); postMapper.updateById(post);
        notificationService.create(post.getUserId(), adminId, 4, "帖子已被下架", detail, 1, postId);
        log(adminId, "DOWN_POST", "POST", postId, detail, ip);
    }

    @Transactional
    public void restorePost(long adminId, long postId, String ip) {
        ForumPost post = postMapper.selectById(postId);
        if (post == null || post.getAuditStatus() != 1 || post.getStatus() != 2) {
            throw new BusinessException(404, "已下架帖子不存在");
        }
        post.setStatus(1);
        post.setAuditReason(null);
        postMapper.updateById(post);
        notificationService.create(post.getUserId(), adminId, 4, "帖子已恢复上架",
                "管理员已恢复展示该帖子", 1, postId);
        log(adminId, "RESTORE_POST", "POST", postId, "恢复上架", ip);
    }

    public PageResponse<Confess> pendingConfesses(long page, long size) {
        IPage<Confess> result = confessMapper.selectPage(Page.of(page, size),
                Wrappers.<Confess>lambdaQuery().eq(Confess::getAuditStatus, 0)
                        .orderByAsc(Confess::getCreatedAt));
        return PageResponse.from(result);
    }

    public PageResponse<Activity> pendingActivities(long page, long size) {
        IPage<Activity> result = activityMapper.selectPage(Page.of(page, size),
                Wrappers.<Activity>lambdaQuery().eq(Activity::getAuditStatus, 0)
                        .orderByAsc(Activity::getCreatedAt));
        return PageResponse.from(result);
    }

    @Transactional
    public void audit(long adminId, String type, long id, AuditRequest request, String ip) {
        if (request.status() == 2 && !StringUtils.hasText(request.reason())) {
            throw BusinessException.badRequest("审核驳回时必须填写原因");
        }
        String reason = StringUtils.hasText(request.reason()) ? request.reason().trim() : null;
        long ownerId;
        switch (type.toLowerCase()) {
            case "post" -> {
                ForumPost post = postMapper.selectById(id);
                if (post == null) throw new BusinessException(404, "帖子不存在");
                ensurePending(post.getAuditStatus());
                post.setAuditStatus(request.status()); post.setAuditReason(reason); postMapper.updateById(post);
                ownerId = post.getUserId();
            }
            case "confess" -> {
                Confess confess = confessMapper.selectById(id);
                if (confess == null) throw new BusinessException(404, "表白不存在");
                ensurePending(confess.getAuditStatus());
                confess.setAuditStatus(request.status()); confess.setAuditReason(reason); confessMapper.updateById(confess);
                ownerId = confess.getUserId();
            }
            case "activity" -> {
                Activity activity = activityMapper.selectById(id);
                if (activity == null) throw new BusinessException(404, "活动不存在");
                ensurePending(activity.getAuditStatus());
                activity.setAuditStatus(request.status()); activity.setAuditReason(reason); activityMapper.updateById(activity);
                ownerId = activity.getCreatorId();
            }
            default -> throw BusinessException.badRequest("不支持的审核类型");
        }
        notificationService.create(ownerId, null, 4,
                request.status() == 1 ? "内容审核已通过" : "内容审核未通过", reason,
                switch (type.toLowerCase()) { case "post" -> 1; case "confess" -> 2; default -> 3; }, id);
        log(adminId, request.status() == 1 ? "AUDIT_APPROVE" : "AUDIT_REJECT",
                type.toUpperCase(), id, reason, ip);
    }

    private void ensurePending(int status) {
        if (status != 0) throw BusinessException.badRequest("该内容已经审核，不能重复处理");
    }

    private void log(long adminId, String action, String type, long id, String reason, String ip) {
        AdminAuditLog log = new AdminAuditLog();
        log.setAdminId(adminId); log.setAction(action); log.setBizType(type); log.setBizId(id); log.setResult(1);
        log.setDetail(json(Map.of("reason", reason == null ? "" : reason)));
        log.setIpAddress(ip); log.setCreatedAt(LocalDateTime.now());
        auditLogMapper.insert(log);
    }

    private String json(Map<String, String> value) {
        try { return objectMapper.writeValueAsString(value); }
        catch (JsonProcessingException exception) { return "{}"; }
    }
}
