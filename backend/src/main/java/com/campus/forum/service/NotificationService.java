package com.campus.forum.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.notification.NotificationResponse;
import com.campus.forum.entity.Notification;
import com.campus.forum.entity.User;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.NotificationMapper;
import com.campus.forum.mapper.UserMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationMapper notificationMapper;
    private final UserMapper userMapper;

    public void create(long receiverId, Long actorId, int type, String title, String content,
                       Integer bizType, Long bizId) {
        if (actorId != null && receiverId == actorId) return;
        Notification notification = new Notification();
        notification.setUserId(receiverId); notification.setActorId(actorId); notification.setType(type);
        notification.setTitle(title); notification.setContent(content); notification.setBizType(bizType);
        notification.setBizId(bizId); notification.setIsRead(0); notification.setCreatedAt(LocalDateTime.now());
        notificationMapper.insert(notification);
    }

    public PageResponse<NotificationResponse> list(long userId, long page, long size) {
        IPage<Notification> result = notificationMapper.selectPage(Page.of(page, size),
                Wrappers.<Notification>lambdaQuery().eq(Notification::getUserId, userId)
                        .orderByDesc(Notification::getCreatedAt));
        List<NotificationResponse> records = result.getRecords().stream().map(this::toResponse).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    public long unreadCount(long userId) {
        return notificationMapper.selectCount(Wrappers.<Notification>lambdaQuery()
                .eq(Notification::getUserId, userId).eq(Notification::getIsRead, 0));
    }

    @Transactional
    public void markRead(long userId, long notificationId) {
        Notification notification = notificationMapper.selectById(notificationId);
        if (notification == null || notification.getUserId() != userId) {
            throw new BusinessException(404, "通知不存在");
        }
        if (notification.getIsRead() == 0) {
            notification.setIsRead(1); notification.setReadAt(LocalDateTime.now());
            notificationMapper.updateById(notification);
        }
    }

    @Transactional
    public void markAllRead(long userId) {
        Notification update = new Notification();
        update.setIsRead(1); update.setReadAt(LocalDateTime.now());
        notificationMapper.update(update, Wrappers.<Notification>lambdaUpdate()
                .eq(Notification::getUserId, userId).eq(Notification::getIsRead, 0));
    }

    private NotificationResponse toResponse(Notification item) {
        User actor = item.getActorId() == null ? null : userMapper.selectById(item.getActorId());
        return new NotificationResponse(item.getId(), item.getType(), item.getActorId(),
                actor == null ? null : actor.getNickname(), actor == null ? null : actor.getAvatarUrl(),
                item.getTitle(), item.getContent(), item.getBizType(), item.getBizId(),
                item.getIsRead() == 1, item.getCreatedAt());
    }
}
