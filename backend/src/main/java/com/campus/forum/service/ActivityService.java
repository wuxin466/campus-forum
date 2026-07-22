package com.campus.forum.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.activity.ActivityResponse;
import com.campus.forum.dto.activity.CreateActivityRequest;
import com.campus.forum.entity.Activity;
import com.campus.forum.entity.ActivityCategory;
import com.campus.forum.entity.ActivitySign;
import com.campus.forum.entity.User;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.ActivityCategoryMapper;
import com.campus.forum.mapper.ActivityMapper;
import com.campus.forum.mapper.ActivitySignMapper;
import com.campus.forum.mapper.UserMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ActivityService {
    private final ActivityMapper activityMapper;
    private final ActivityCategoryMapper categoryMapper;
    private final ActivitySignMapper signMapper;
    private final UserMapper userMapper;

    public List<ActivityCategory> categories() {
        return categoryMapper.selectList(Wrappers.<ActivityCategory>lambdaQuery()
                .eq(ActivityCategory::getStatus, 1).orderByAsc(ActivityCategory::getSortNo));
    }

    public PageResponse<ActivityResponse> upcoming(long page, long size, Long categoryId,
                                                    String keyword, Long currentUserId) {
        IPage<Activity> result = activityMapper.selectPage(Page.of(page, size),
                Wrappers.<Activity>lambdaQuery().eq(Activity::getAuditStatus, 1)
                        .in(Activity::getStatus, 1, 2)
                        .ge(Activity::getEndAt, LocalDateTime.now())
                        .eq(categoryId != null, Activity::getCategoryId, categoryId)
                        .and(StringUtils.hasText(keyword), query -> query.like(Activity::getTitle, keyword)
                                .or().like(Activity::getLocation, keyword))
                        .orderByAsc(Activity::getStartAt));
        List<ActivityResponse> records = result.getRecords().stream()
                .map(activity -> toResponse(activity, currentUserId)).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    @Transactional
    public ActivityResponse detail(long id, Long currentUserId) {
        Activity activity = requireVisible(id);
        activityMapper.incrementView(id);
        activity.setViewCount(activity.getViewCount() + 1);
        return toResponse(activity, currentUserId);
    }

    @Transactional
    public ActivityResponse create(long userId, CreateActivityRequest request) {
        ActivityCategory category = categoryMapper.selectById(request.categoryId());
        if (category == null || category.getStatus() != 1) throw BusinessException.badRequest("活动分类不存在或已停用");
        if (!request.endAt().isAfter(request.startAt())) throw BusinessException.badRequest("结束时间必须晚于开始时间");
        if (request.signupDeadline().isAfter(request.startAt())) throw BusinessException.badRequest("报名截止时间不能晚于开始时间");
        Activity activity = new Activity();
        activity.setCategoryId(request.categoryId()); activity.setCreatorId(userId);
        activity.setTitle(request.title().trim()); activity.setPosterUrl(blankToNull(request.posterUrl()));
        activity.setContent(request.content().trim()); activity.setLocation(request.location().trim());
        activity.setStartAt(request.startAt()); activity.setEndAt(request.endAt());
        activity.setSignupDeadline(request.signupDeadline()); activity.setCapacity(request.capacity());
        activity.setSignedCount(0); activity.setViewCount(0); activity.setAuditStatus(0);
        activity.setStatus(1); activity.setDeleted(0);
        activityMapper.insert(activity);
        return toResponse(activity, userId);
    }

    @Transactional
    public boolean toggleSign(long userId, long activityId) {
        requireVisible(activityId);
        ActivitySign existing = signMapper.selectOne(Wrappers.<ActivitySign>lambdaQuery()
                .eq(ActivitySign::getActivityId, activityId).eq(ActivitySign::getUserId, userId));
        if (existing != null && existing.getStatus() != 0) {
            if (existing.getStatus() == 2) throw BusinessException.badRequest("已签到，不能取消报名");
            existing.setStatus(0); existing.setUpdatedAt(LocalDateTime.now());
            signMapper.updateById(existing);
            activityMapper.releaseSeat(activityId);
            return false;
        }
        if (activityMapper.reserveSeat(activityId) == 0) throw BusinessException.badRequest("活动已满或已停止报名");
        try {
            if (existing == null) {
                ActivitySign sign = new ActivitySign();
                sign.setActivityId(activityId); sign.setUserId(userId); sign.setStatus(1);
                sign.setSignedAt(LocalDateTime.now()); sign.setUpdatedAt(LocalDateTime.now());
                signMapper.insert(sign);
            } else {
                existing.setStatus(1); existing.setSignedAt(LocalDateTime.now()); existing.setUpdatedAt(LocalDateTime.now());
                signMapper.updateById(existing);
            }
        } catch (DuplicateKeyException exception) {
            activityMapper.releaseSeat(activityId);
            return true;
        }
        return true;
    }

    public PageResponse<ActivityResponse> mySigns(long userId, long page, long size) {
        IPage<ActivitySign> signs = signMapper.selectPage(Page.of(page, size),
                Wrappers.<ActivitySign>lambdaQuery().eq(ActivitySign::getUserId, userId)
                        .in(ActivitySign::getStatus, 1, 2).orderByDesc(ActivitySign::getSignedAt));
        List<ActivityResponse> records = signs.getRecords().stream().map(ActivitySign::getActivityId)
                .map(activityMapper::selectById).filter(activity -> activity != null)
                .map(activity -> toResponse(activity, userId)).toList();
        return new PageResponse<>(records, signs.getTotal(), signs.getCurrent(), signs.getSize(), signs.getPages());
    }

    private Activity requireVisible(long id) {
        Activity activity = activityMapper.selectOne(Wrappers.<Activity>lambdaQuery()
                .eq(Activity::getId, id).eq(Activity::getAuditStatus, 1).ne(Activity::getStatus, 0));
        if (activity == null) throw new BusinessException(404, "活动不存在或尚未通过审核");
        return activity;
    }

    private ActivityResponse toResponse(Activity activity, Long currentUserId) {
        ActivityCategory category = categoryMapper.selectById(activity.getCategoryId());
        User creator = userMapper.selectById(activity.getCreatorId());
        boolean signed = currentUserId != null && signMapper.exists(Wrappers.<ActivitySign>lambdaQuery()
                .eq(ActivitySign::getActivityId, activity.getId()).eq(ActivitySign::getUserId, currentUserId)
                .in(ActivitySign::getStatus, 1, 2));
        return new ActivityResponse(activity.getId(), activity.getCategoryId(), category.getName(),
                activity.getCreatorId(), creator.getNickname(), activity.getTitle(), activity.getPosterUrl(),
                activity.getContent(), activity.getLocation(), activity.getStartAt(), activity.getEndAt(),
                activity.getSignupDeadline(), activity.getCapacity(), activity.getSignedCount(),
                activity.getViewCount(), activity.getStatus(), signed, activity.getCreatedAt());
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
