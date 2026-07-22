package com.campus.forum.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.campus.forum.dto.user.FriendRequestResponse;
import com.campus.forum.dto.user.PublicUserResponse;
import com.campus.forum.entity.User;
import com.campus.forum.entity.UserFriend;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.UserFriendMapper;
import com.campus.forum.mapper.UserMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FriendService {
    private final UserFriendMapper friendMapper;
    private final UserMapper userMapper;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public long apply(long requesterId, long addresseeId) {
        if (requesterId == addresseeId) throw BusinessException.badRequest("不能添加自己为好友");
        userService.requireActiveUser(addresseeId);
        UserFriend existing = friendMapper.selectOne(userService.pairQuery(requesterId, addresseeId));
        if (existing != null && existing.getStatus() == 1) throw BusinessException.badRequest("对方已经是你的好友");
        if (existing != null && existing.getStatus() == 0) throw BusinessException.badRequest("好友申请正在等待处理");
        if (existing != null) {
            existing.setRequesterId(requesterId);
            existing.setAddresseeId(addresseeId);
            existing.setStatus(0);
            existing.setAppliedAt(LocalDateTime.now());
            existing.setHandledAt(null);
            friendMapper.updateById(existing);
            notificationService.create(addresseeId, requesterId, 3, "新的好友申请", null, null, existing.getId());
            return existing.getId();
        }
        UserFriend relation = new UserFriend();
        relation.setRequesterId(requesterId); relation.setAddresseeId(addresseeId); relation.setStatus(0);
        relation.setAppliedAt(LocalDateTime.now()); relation.setUpdatedAt(LocalDateTime.now());
        friendMapper.insert(relation);
        notificationService.create(addresseeId, requesterId, 3, "新的好友申请", null, null, relation.getId());
        return relation.getId();
    }

    public List<FriendRequestResponse> pendingRequests(long userId) {
        return friendMapper.selectList(Wrappers.<UserFriend>lambdaQuery()
                        .eq(UserFriend::getAddresseeId, userId).eq(UserFriend::getStatus, 0)
                        .orderByDesc(UserFriend::getAppliedAt))
                .stream().map(relation -> toRequest(relation, relation.getRequesterId())).toList();
    }

    @Transactional
    public void handle(long userId, long requestId, boolean accept) {
        UserFriend relation = friendMapper.selectById(requestId);
        if (relation == null || relation.getAddresseeId() != userId || relation.getStatus() != 0) {
            throw new BusinessException(404, "好友申请不存在或已处理");
        }
        relation.setStatus(accept ? 1 : 2);
        relation.setHandledAt(LocalDateTime.now());
        friendMapper.updateById(relation);
        if (accept) {
            notificationService.create(relation.getRequesterId(), userId, 3, "好友申请已通过",
                    null, null, relation.getId());
        }
    }

    public List<PublicUserResponse> friends(long userId) {
        return friendMapper.selectList(Wrappers.<UserFriend>lambdaQuery().eq(UserFriend::getStatus, 1)
                        .and(query -> query.eq(UserFriend::getRequesterId, userId)
                                .or().eq(UserFriend::getAddresseeId, userId))
                        .orderByDesc(UserFriend::getHandledAt))
                .stream().map(relation -> relation.getRequesterId() == userId
                        ? relation.getAddresseeId() : relation.getRequesterId())
                .map(userMapper::selectById).filter(user -> user != null && user.getStatus() == 1)
                .map(user -> PublicUserResponse.from(user, true)).toList();
    }

    @Transactional
    public void remove(long userId, long friendId) {
        UserFriend relation = friendMapper.selectOne(userService.pairQuery(userId, friendId)
                .eq(UserFriend::getStatus, 1));
        if (relation == null) throw new BusinessException(404, "好友关系不存在");
        relation.setStatus(3);
        relation.setHandledAt(LocalDateTime.now());
        friendMapper.updateById(relation);
    }

    private FriendRequestResponse toRequest(UserFriend relation, long otherUserId) {
        User user = userMapper.selectById(otherUserId);
        return new FriendRequestResponse(relation.getId(), user.getId(), user.getNickname(), user.getAvatarUrl(),
                user.getCollege(), relation.getStatus(), relation.getAppliedAt());
    }
}
