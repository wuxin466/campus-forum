package com.campus.forum.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.message.ConversationResponse;
import com.campus.forum.dto.message.MessageResponse;
import com.campus.forum.dto.message.SendMessageRequest;
import com.campus.forum.entity.Message;
import com.campus.forum.entity.User;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.MessageMapper;
import com.campus.forum.mapper.UserMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageMapper messageMapper;
    private final UserMapper userMapper;
    private final UserService userService;

    @Transactional
    public MessageResponse send(long senderId, long receiverId, SendMessageRequest request) {
        if (senderId == receiverId) throw BusinessException.badRequest("不能给自己发送私信");
        userService.requireActiveUser(receiverId);
        if (!userService.isFriend(senderId, receiverId)) throw new BusinessException(403, "仅好友之间可以发送私信");
        validatePayload(request);
        Message message = new Message();
        message.setSenderId(senderId); message.setReceiverId(receiverId);
        message.setMessageType(request.messageType());
        message.setContent(request.messageType() == 0 ? request.content().trim() : blankToNull(request.content()));
        message.setFileUrl(request.messageType() == 0 ? null : request.fileUrl().trim());
        message.setIsRead(0); message.setCreatedAt(LocalDateTime.now());
        message.setDeletedBySender(0); message.setDeletedByReceiver(0);
        messageMapper.insert(message);
        return toResponse(message);
    }

    public List<ConversationResponse> conversations(long userId) {
        return messageMapper.selectLatestConversations(userId).stream().map(message -> {
            long otherId = message.getSenderId() == userId ? message.getReceiverId() : message.getSenderId();
            User user = userMapper.selectById(otherId);
            String preview = message.getMessageType() == 0 ? message.getContent()
                    : message.getMessageType() == 1 ? "[图片]" : "[文件]";
            return new ConversationResponse(otherId, user.getNickname(), user.getAvatarUrl(), preview,
                    message.getMessageType(), message.getCreatedAt(),
                    messageMapper.countConversationUnread(userId, otherId));
        }).toList();
    }

    @Transactional
    public PageResponse<MessageResponse> history(long userId, long otherId, long page, long size) {
        userService.requireActiveUser(otherId);
        IPage<Message> result = messageMapper.selectPage(Page.of(page, size),
                Wrappers.<Message>lambdaQuery()
                        .and(pair -> pair.eq(Message::getSenderId, userId).eq(Message::getReceiverId, otherId)
                                .or(reverse -> reverse.eq(Message::getSenderId, otherId).eq(Message::getReceiverId, userId)))
                        .and(visible -> visible
                                .and(own -> own.eq(Message::getSenderId, userId).eq(Message::getDeletedBySender, 0))
                                .or(received -> received.eq(Message::getReceiverId, userId).eq(Message::getDeletedByReceiver, 0)))
                        .orderByDesc(Message::getCreatedAt));
        messageMapper.markConversationRead(userId, otherId);
        List<MessageResponse> records = result.getRecords().stream().map(message -> {
            if (message.getReceiverId() == userId) {
                message.setIsRead(1);
                if (message.getReadAt() == null) message.setReadAt(LocalDateTime.now());
            }
            return toResponse(message);
        }).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    public long unreadCount(long userId) {
        return messageMapper.countUnread(userId);
    }

    @Transactional
    public void markRead(long userId, long otherId) {
        messageMapper.markConversationRead(userId, otherId);
    }

    private void validatePayload(SendMessageRequest request) {
        if (request.messageType() == 0 && !StringUtils.hasText(request.content())) {
            throw BusinessException.badRequest("文本消息不能为空");
        }
        if (request.messageType() != 0 && !StringUtils.hasText(request.fileUrl())) {
            throw BusinessException.badRequest("图片或文件地址不能为空");
        }
    }

    private MessageResponse toResponse(Message message) {
        return new MessageResponse(message.getId(), message.getSenderId(), message.getReceiverId(),
                message.getMessageType(), message.getContent(), message.getFileUrl(), message.getIsRead() == 1,
                message.getReadAt(), message.getCreatedAt());
    }

    private String blankToNull(String value) { return StringUtils.hasText(value) ? value.trim() : null; }
}
