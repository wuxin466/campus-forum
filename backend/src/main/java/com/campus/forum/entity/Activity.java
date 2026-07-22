package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("activity")
public class Activity extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long categoryId;
    private Long creatorId;
    private String title;
    private String posterUrl;
    private String content;
    private String location;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private LocalDateTime signupDeadline;
    private Integer capacity;
    private Integer signedCount;
    private Integer viewCount;
    private Integer auditStatus;
    private String auditReason;
    private Integer status;
}
