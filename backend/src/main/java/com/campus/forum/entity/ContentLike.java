package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("content_like")
public class ContentLike {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Integer bizType;
    private Long bizId;
    private LocalDateTime createdAt;
}
