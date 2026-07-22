package com.campus.forum.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.forum.CommentResponse;
import com.campus.forum.dto.forum.CreateCommentRequest;
import com.campus.forum.dto.forum.CreatePostRequest;
import com.campus.forum.dto.forum.PostResponse;
import com.campus.forum.entity.ContentLike;
import com.campus.forum.entity.ForumCategory;
import com.campus.forum.entity.ForumComment;
import com.campus.forum.entity.ForumPost;
import com.campus.forum.entity.ForumPostTag;
import com.campus.forum.entity.ForumTag;
import com.campus.forum.entity.User;
import com.campus.forum.entity.UserCollection;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.ContentLikeMapper;
import com.campus.forum.mapper.ForumCategoryMapper;
import com.campus.forum.mapper.ForumCommentMapper;
import com.campus.forum.mapper.ForumPostMapper;
import com.campus.forum.mapper.ForumPostTagMapper;
import com.campus.forum.mapper.ForumTagMapper;
import com.campus.forum.mapper.UserCollectionMapper;
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
public class ForumService {
    private static final int POST = 1;
    private final ForumCategoryMapper categoryMapper;
    private final ForumPostMapper postMapper;
    private final ForumTagMapper tagMapper;
    private final ForumPostTagMapper postTagMapper;
    private final ForumCommentMapper commentMapper;
    private final ContentLikeMapper likeMapper;
    private final UserCollectionMapper collectionMapper;
    private final UserMapper userMapper;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;

    public List<ForumCategory> categories() {
        return categoryMapper.selectList(Wrappers.<ForumCategory>lambdaQuery()
                .eq(ForumCategory::getStatus, 1).orderByAsc(ForumCategory::getSortNo));
    }

    public PageResponse<PostResponse> posts(long page, long size, Long categoryId, String keyword,
                                            String sort, Long currentUserId) {
        var query = Wrappers.<ForumPost>lambdaQuery()
                .eq(ForumPost::getAuditStatus, 1).eq(ForumPost::getStatus, 1)
                .eq(categoryId != null, ForumPost::getCategoryId, categoryId)
                .and(StringUtils.hasText(keyword), wrapper -> wrapper
                        .like(ForumPost::getTitle, keyword).or().like(ForumPost::getContent, keyword));
        if ("hot".equalsIgnoreCase(sort)) {
            query.orderByDesc(ForumPost::getIsTop, ForumPost::getLikeCount, ForumPost::getViewCount);
        } else {
            query.orderByDesc(ForumPost::getIsTop, ForumPost::getCreatedAt);
        }
        IPage<ForumPost> result = postMapper.selectPage(Page.of(page, size), query);
        List<PostResponse> records = result.getRecords().stream().map(post -> toResponse(post, currentUserId)).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    @Transactional
    public PostResponse detail(long id, Long currentUserId) {
        ForumPost post = requireVisiblePost(id);
        postMapper.incrementViewCount(id);
        post.setViewCount(post.getViewCount() + 1);
        return toResponse(post, currentUserId);
    }

    @Transactional
    public PostResponse create(long userId, CreatePostRequest request) {
        ForumCategory category = categoryMapper.selectById(request.categoryId());
        if (category == null || category.getStatus() != 1) throw BusinessException.badRequest("论坛板块不存在或已停用");
        ForumPost post = new ForumPost();
        post.setUserId(userId);
        post.setCategoryId(request.categoryId());
        post.setTitle(request.title().trim());
        post.setContent(request.content().trim());
        post.setImageUrls(writeJson(request.imageUrls() == null ? List.of() : request.imageUrls()));
        post.setCoverUrl(request.imageUrls() == null || request.imageUrls().isEmpty() ? null : request.imageUrls().get(0));
        post.setViewCount(0); post.setLikeCount(0); post.setCommentCount(0); post.setCollectCount(0);
        post.setIsTop(0); post.setIsFeatured(0); post.setAuditStatus(0); post.setStatus(1); post.setDeleted(0);
        postMapper.insert(post);
        if (request.tags() != null) request.tags().stream().map(String::trim).distinct().forEach(tag -> bindTag(post.getId(), tag));
        return toResponse(post, userId);
    }

    public PageResponse<CommentResponse> comments(long postId, long page, long size) {
        requireVisiblePost(postId);
        IPage<ForumComment> result = commentMapper.selectPage(Page.of(page, size),
                Wrappers.<ForumComment>lambdaQuery().eq(ForumComment::getBizType, POST)
                        .eq(ForumComment::getBizId, postId).eq(ForumComment::getAuditStatus, 1)
                        .orderByAsc(ForumComment::getCreatedAt));
        List<CommentResponse> records = result.getRecords().stream().map(this::toCommentResponse).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    @Transactional
    public CommentResponse comment(long userId, long postId, CreateCommentRequest request) {
        ForumPost targetPost = requireVisiblePost(postId);
        ForumComment parent = null;
        if (request.parentId() != null) {
            parent = commentMapper.selectById(request.parentId());
            if (parent == null || parent.getBizType() != POST || parent.getBizId() != postId || parent.getDeleted() == 1) {
                throw BusinessException.badRequest("父评论不存在");
            }
        }
        ForumComment comment = new ForumComment();
        comment.setBizType(POST); comment.setBizId(postId); comment.setUserId(userId);
        comment.setContent(request.content().trim()); comment.setLikeCount(0); comment.setAuditStatus(1); comment.setDeleted(0);
        if (parent != null) {
            comment.setParentId(parent.getId());
            comment.setRootId(parent.getRootId() == null ? parent.getId() : parent.getRootId());
            comment.setReplyUserId(parent.getUserId());
        }
        commentMapper.insert(comment);
        postMapper.incrementCommentCount(postId);
        notificationService.create(targetPost.getUserId(), userId, 2, "收到新评论",
                comment.getContent(), POST, postId);
        return toCommentResponse(comment);
    }

    @Transactional
    public boolean toggleLike(long userId, long postId) {
        ForumPost targetPost = requireVisiblePost(postId);
        ContentLike existing = likeMapper.selectOne(Wrappers.<ContentLike>lambdaQuery()
                .eq(ContentLike::getUserId, userId).eq(ContentLike::getBizType, POST).eq(ContentLike::getBizId, postId));
        if (existing != null) {
            likeMapper.deleteById(existing.getId());
            postMapper.changeLikeCount(postId, -1);
            return false;
        }
        ContentLike like = new ContentLike();
        like.setUserId(userId); like.setBizType(POST); like.setBizId(postId); like.setCreatedAt(LocalDateTime.now());
        try {
            likeMapper.insert(like);
        } catch (DuplicateKeyException ignored) {
            return true;
        }
        postMapper.changeLikeCount(postId, 1);
        notificationService.create(targetPost.getUserId(), userId, 1, "帖子获得新点赞",
                null, POST, postId);
        return true;
    }

    @Transactional
    public boolean toggleCollection(long userId, long postId) {
        requireVisiblePost(postId);
        UserCollection existing = collectionMapper.selectOne(Wrappers.<UserCollection>lambdaQuery()
                .eq(UserCollection::getUserId, userId).eq(UserCollection::getBizType, POST)
                .eq(UserCollection::getBizId, postId));
        if (existing != null) {
            collectionMapper.deleteById(existing.getId());
            postMapper.changeCollectCount(postId, -1);
            return false;
        }
        UserCollection collection = new UserCollection();
        collection.setUserId(userId); collection.setBizType(POST); collection.setBizId(postId);
        collection.setCreatedAt(LocalDateTime.now());
        try {
            collectionMapper.insert(collection);
        } catch (DuplicateKeyException ignored) {
            return true;
        }
        postMapper.changeCollectCount(postId, 1);
        return true;
    }

    private ForumPost requireVisiblePost(long id) {
        ForumPost post = postMapper.selectOne(Wrappers.<ForumPost>lambdaQuery().eq(ForumPost::getId, id)
                .eq(ForumPost::getAuditStatus, 1).eq(ForumPost::getStatus, 1));
        if (post == null) throw new BusinessException(404, "帖子不存在或尚未通过审核");
        return post;
    }

    private void bindTag(long postId, String name) {
        ForumTag tag = tagMapper.selectOne(Wrappers.<ForumTag>lambdaQuery().eq(ForumTag::getName, name));
        if (tag == null) {
            tag = new ForumTag(); tag.setName(name); tag.setUseCount(0); tag.setCreatedAt(LocalDateTime.now());
            try {
                tagMapper.insert(tag);
            } catch (DuplicateKeyException ignored) {
                tag = tagMapper.selectOne(Wrappers.<ForumTag>lambdaQuery().eq(ForumTag::getName, name));
            }
        }
        ForumPostTag relation = new ForumPostTag(); relation.setPostId(postId); relation.setTagId(tag.getId());
        postTagMapper.insert(relation);
        tag.setUseCount(tag.getUseCount() + 1);
        tagMapper.updateById(tag);
    }

    private PostResponse toResponse(ForumPost post, Long currentUserId) {
        User user = userMapper.selectById(post.getUserId());
        ForumCategory category = categoryMapper.selectById(post.getCategoryId());
        List<Long> tagIds = postTagMapper.selectList(Wrappers.<ForumPostTag>lambdaQuery()
                .eq(ForumPostTag::getPostId, post.getId())).stream().map(ForumPostTag::getTagId).toList();
        List<String> tags = tagIds.isEmpty() ? List.of() : tagMapper.selectByIds(tagIds).stream().map(ForumTag::getName).toList();
        boolean liked = currentUserId != null && likeMapper.exists(Wrappers.<ContentLike>lambdaQuery()
                .eq(ContentLike::getUserId, currentUserId).eq(ContentLike::getBizType, POST).eq(ContentLike::getBizId, post.getId()));
        boolean collected = currentUserId != null && collectionMapper.exists(Wrappers.<UserCollection>lambdaQuery()
                .eq(UserCollection::getUserId, currentUserId).eq(UserCollection::getBizType, POST)
                .eq(UserCollection::getBizId, post.getId()));
        return new PostResponse(post.getId(), post.getUserId(), user.getNickname(), user.getAvatarUrl(), user.getCollege(),
                post.getCategoryId(), category.getName(), post.getTitle(), post.getContent(), readImages(post.getImageUrls()), tags,
                post.getViewCount(), post.getLikeCount(), post.getCommentCount(), post.getCollectCount(), post.getIsTop() == 1,
                post.getIsFeatured() == 1, liked, collected, post.getCreatedAt());
    }

    private CommentResponse toCommentResponse(ForumComment comment) {
        User user = userMapper.selectById(comment.getUserId());
        return new CommentResponse(comment.getId(), comment.getParentId(), comment.getRootId(), comment.getUserId(),
                user.getNickname(), user.getAvatarUrl(), comment.getReplyUserId(), comment.getContent(),
                comment.getLikeCount(), comment.getCreatedAt());
    }

    private String writeJson(List<String> values) {
        try { return objectMapper.writeValueAsString(values); }
        catch (JsonProcessingException exception) { throw BusinessException.badRequest("图片地址格式错误"); }
    }

    private List<String> readImages(String value) {
        if (!StringUtils.hasText(value)) return List.of();
        try { return objectMapper.readValue(value, new TypeReference<>() {}); }
        catch (JsonProcessingException exception) { return List.of(); }
    }
}
