package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("message")
public class Message {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long senderId;
    private Long receiverId;
    private Integer messageType;
    private String content;
    private String fileUrl;
    private Integer isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private Integer deletedBySender;
    private Integer deletedByReceiver;
}
