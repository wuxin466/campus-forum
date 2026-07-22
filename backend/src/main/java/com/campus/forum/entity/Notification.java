package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("notification")
public class Notification {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long actorId;
    private Integer type;
    private String title;
    private String content;
    private Integer bizType;
    private Long bizId;
    private Integer isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
