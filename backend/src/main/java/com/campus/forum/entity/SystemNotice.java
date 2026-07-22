package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("system_notice")
public class SystemNotice extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long publisherId;
    private String title;
    private String content;
    private Integer targetType;
    private Integer isTop;
    private Integer status;
    private LocalDateTime publishedAt;
}
