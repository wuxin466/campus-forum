package com.campus.forum.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.user.PublicUserResponse;
import com.campus.forum.dto.user.UpdateProfileRequest;
import com.campus.forum.dto.user.UserProfileResponse;
import com.campus.forum.entity.User;
import com.campus.forum.entity.UserFriend;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.UserFriendMapper;
import com.campus.forum.mapper.UserMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper;
    private final UserFriendMapper friendMapper;

    public UserProfileResponse me(long userId) {
        return UserProfileResponse.from(requireActiveUser(userId));
    }

    @Transactional
    public UserProfileResponse update(long userId, UpdateProfileRequest request) {
        User user = requireActiveUser(userId);
        if (request.nickname() != null) user.setNickname(request.nickname().trim());
        if (request.avatarUrl() != null) user.setAvatarUrl(blankToNull(request.avatarUrl()));
        if (request.college() != null) user.setCollege(blankToNull(request.college()));
        if (request.grade() != null) user.setGrade(blankToNull(request.grade()));
        if (request.bio() != null) user.setBio(blankToNull(request.bio()));
        userMapper.updateById(user);
        return UserProfileResponse.from(user);
    }

    public PublicUserResponse profile(long currentUserId, long targetUserId) {
        User target = requireActiveUser(targetUserId);
        return PublicUserResponse.from(target, currentUserId != targetUserId && isFriend(currentUserId, targetUserId));
    }

    public List<PublicUserResponse> search(long currentUserId, String keyword) {
        if (!StringUtils.hasText(keyword)) return List.of();
        String value = keyword.trim();
        return userMapper.selectList(Wrappers.<User>lambdaQuery()
                        .eq(User::getStatus, 1).ne(User::getId, currentUserId)
                        .and(query -> query.like(User::getNickname, value).or().like(User::getCollege, value))
                        .orderByDesc(User::getVerifyStatus).last("LIMIT 20"))
                .stream().map(user -> PublicUserResponse.from(user, isFriend(currentUserId, user.getId()))).toList();
    }

    public List<PublicUserResponse> publicSearch(Long currentUserId, String keyword, int limit) {
        if (!StringUtils.hasText(keyword)) return List.of();
        int safeLimit = Math.max(1, Math.min(limit, 20));
        String value = keyword.trim();
        return userMapper.selectList(Wrappers.<User>lambdaQuery()
                        .eq(User::getStatus, 1)
                        .ne(currentUserId != null, User::getId, currentUserId)
                        .and(query -> query.like(User::getNickname, value)
                                .or().like(User::getCollege, value)
                                .or().like(User::getGrade, value))
                        .orderByDesc(User::getVerifyStatus).last("LIMIT " + safeLimit))
                .stream().map(user -> PublicUserResponse.from(user,
                        currentUserId != null && isFriend(currentUserId, user.getId()))).toList();
    }

    public PageResponse<PublicUserResponse> publicSearchPage(Long currentUserId, String keyword, long page, long size) {
        if (!StringUtils.hasText(keyword)) return new PageResponse<>(List.of(), 0, page, size, 0);
        String value = keyword.trim();
        IPage<User> result = userMapper.selectPage(Page.of(page, size), Wrappers.<User>lambdaQuery()
                .eq(User::getStatus, 1).ne(currentUserId != null, User::getId, currentUserId)
                .and(query -> query.like(User::getNickname, value).or().like(User::getCollege, value)
                        .or().like(User::getGrade, value).or().like(User::getUsername, value))
                .orderByDesc(User::getVerifyStatus));
        List<PublicUserResponse> records = result.getRecords().stream().map(user -> PublicUserResponse.from(user,
                currentUserId != null && isFriend(currentUserId, user.getId()))).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    User requireActiveUser(long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getStatus() != 1) throw new BusinessException(404, "用户不存在或状态异常");
        return user;
    }

    boolean isFriend(long first, long second) {
        return friendMapper.exists(pairQuery(first, second).eq(UserFriend::getStatus, 1));
    }

    com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<UserFriend> pairQuery(long first, long second) {
        return Wrappers.<UserFriend>lambdaQuery().and(query -> query
                .eq(UserFriend::getRequesterId, first).eq(UserFriend::getAddresseeId, second)
                .or(nested -> nested.eq(UserFriend::getRequesterId, second).eq(UserFriend::getAddresseeId, first)));
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
