package com.campus.forum.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.confess.ConfessResponse;
import com.campus.forum.dto.confess.CreateConfessRequest;
import com.campus.forum.dto.forum.CommentResponse;
import com.campus.forum.dto.forum.CreateCommentRequest;
import com.campus.forum.entity.Confess;
import com.campus.forum.entity.ContentLike;
import com.campus.forum.entity.ForumComment;
import com.campus.forum.entity.User;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.ConfessMapper;
import com.campus.forum.mapper.ContentLikeMapper;
import com.campus.forum.mapper.ForumCommentMapper;
import com.campus.forum.mapper.UserMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ConfessService {
    private static final int CONFESS = 2;
    private final ConfessMapper confessMapper;
    private final ForumCommentMapper commentMapper;
    private final ContentLikeMapper likeMapper;
    private final UserMapper userMapper;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;

    public PageResponse<ConfessResponse> list(long page, long size, Long currentUserId) {
        IPage<Confess> result = confessMapper.selectPage(Page.of(page, size),
                Wrappers.<Confess>lambdaQuery().eq(Confess::getAuditStatus, 1)
                        .eq(Confess::getStatus, 1).orderByDesc(Confess::getCreatedAt));
        List<ConfessResponse> records = result.getRecords().stream()
                .map(item -> toResponse(item, currentUserId, false)).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    public ConfessResponse detail(long id, Long currentUserId) {
        return toResponse(requireVisible(id), currentUserId, false);
    }

    @Transactional
    public ConfessResponse create(long userId, CreateConfessRequest request) {
        Confess confess = new Confess();
        confess.setUserId(userId); confess.setContent(request.content().trim());
        confess.setImageUrls(writeImages(request.imageUrls() == null ? List.of() : request.imageUrls()));
        confess.setIsAnonymous(request.anonymous() ? 1 : 0);
        confess.setLikeCount(0); confess.setCommentCount(0); confess.setAuditStatus(0);
        confess.setStatus(1); confess.setDeleted(0);
        confessMapper.insert(confess);
        return toResponse(confess, userId, true);
    }

    public PageResponse<ConfessResponse> mine(long userId, long page, long size) {
        IPage<Confess> result = confessMapper.selectPage(Page.of(page, size),
                Wrappers.<Confess>lambdaQuery().eq(Confess::getUserId, userId)
                        .orderByDesc(Confess::getCreatedAt));
        List<ConfessResponse> records = result.getRecords().stream()
                .map(item -> toResponse(item, userId, true)).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    @Transactional
    public void delete(long userId, long id) {
        Confess confess = confessMapper.selectById(id);
        if (confess == null || confess.getUserId() != userId) throw new BusinessException(404, "表白不存在");
        confessMapper.deleteById(id);
    }

    public PageResponse<CommentResponse> comments(long confessId, long page, long size) {
        requireVisible(confessId);
        IPage<ForumComment> result = commentMapper.selectPage(Page.of(page, size),
                Wrappers.<ForumComment>lambdaQuery().eq(ForumComment::getBizType, CONFESS)
                        .eq(ForumComment::getBizId, confessId).eq(ForumComment::getAuditStatus, 1)
                        .orderByAsc(ForumComment::getCreatedAt));
        List<CommentResponse> records = result.getRecords().stream().map(this::toComment).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    @Transactional
    public CommentResponse comment(long userId, long confessId, CreateCommentRequest request) {
        Confess targetConfess = requireVisible(confessId);
        ForumComment parent = null;
        if (request.parentId() != null) {
            parent = commentMapper.selectById(request.parentId());
            if (parent == null || parent.getBizType() != CONFESS || parent.getBizId() != confessId || parent.getDeleted() == 1) {
                throw BusinessException.badRequest("父评论不存在");
            }
        }
        ForumComment comment = new ForumComment();
        comment.setBizType(CONFESS); comment.setBizId(confessId); comment.setUserId(userId);
        comment.setContent(request.content().trim()); comment.setLikeCount(0); comment.setAuditStatus(1); comment.setDeleted(0);
        if (parent != null) {
            comment.setParentId(parent.getId());
            comment.setRootId(parent.getRootId() == null ? parent.getId() : parent.getRootId());
            comment.setReplyUserId(parent.getUserId());
        }
        commentMapper.insert(comment);
        confessMapper.incrementCommentCount(confessId);
        notificationService.create(targetConfess.getUserId(), userId, 2, "表白收到新评论",
                comment.getContent(), CONFESS, confessId);
        return toComment(comment);
    }

    @Transactional
    public boolean toggleLike(long userId, long confessId) {
        Confess targetConfess = requireVisible(confessId);
        ContentLike existing = likeMapper.selectOne(Wrappers.<ContentLike>lambdaQuery()
                .eq(ContentLike::getUserId, userId).eq(ContentLike::getBizType, CONFESS)
                .eq(ContentLike::getBizId, confessId));
        if (existing != null) {
            likeMapper.deleteById(existing.getId());
            confessMapper.changeLikeCount(confessId, -1);
            return false;
        }
        ContentLike like = new ContentLike();
        like.setUserId(userId); like.setBizType(CONFESS); like.setBizId(confessId);
        like.setCreatedAt(LocalDateTime.now());
        try {
            likeMapper.insert(like);
        } catch (DuplicateKeyException ignored) {
            return true;
        }
        confessMapper.changeLikeCount(confessId, 1);
        notificationService.create(targetConfess.getUserId(), userId, 1, "表白获得新点赞",
                null, CONFESS, confessId);
        return true;
    }

    private Confess requireVisible(long id) {
        Confess confess = confessMapper.selectOne(Wrappers.<Confess>lambdaQuery().eq(Confess::getId, id)
                .eq(Confess::getAuditStatus, 1).eq(Confess::getStatus, 1));
        if (confess == null) throw new BusinessException(404, "表白不存在或尚未通过审核");
        return confess;
    }

    private ConfessResponse toResponse(Confess confess, Long currentUserId, boolean ownerView) {
        boolean anonymous = confess.getIsAnonymous() == 1;
        User user = userMapper.selectById(confess.getUserId());
        boolean hideIdentity = anonymous && !ownerView;
        boolean liked = currentUserId != null && likeMapper.exists(Wrappers.<ContentLike>lambdaQuery()
                .eq(ContentLike::getUserId, currentUserId).eq(ContentLike::getBizType, CONFESS)
                .eq(ContentLike::getBizId, confess.getId()));
        return new ConfessResponse(confess.getId(), hideIdentity ? null : confess.getUserId(),
                hideIdentity ? "匿名同学" : user.getNickname(), hideIdentity ? null : user.getAvatarUrl(),
                confess.getContent(), readImages(confess.getImageUrls()), anonymous,
                confess.getLikeCount(), confess.getCommentCount(), liked, confess.getAuditStatus(),
                ownerView ? confess.getAuditReason() : null, confess.getCreatedAt());
    }

    private CommentResponse toComment(ForumComment comment) {
        User user = userMapper.selectById(comment.getUserId());
        return new CommentResponse(comment.getId(), comment.getParentId(), comment.getRootId(), comment.getUserId(),
                user.getNickname(), user.getAvatarUrl(), comment.getReplyUserId(), comment.getContent(),
                comment.getLikeCount(), comment.getCreatedAt());
    }

    private String writeImages(List<String> images) {
        try { return objectMapper.writeValueAsString(images); }
        catch (JsonProcessingException exception) { throw BusinessException.badRequest("图片地址格式错误"); }
    }

    private List<String> readImages(String value) {
        if (!StringUtils.hasText(value)) return List.of();
        try { return objectMapper.readValue(value, new TypeReference<>() {}); }
        catch (JsonProcessingException exception) { return List.of(); }
    }
}
