package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("confess")
public class Confess extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String content;
    private String imageUrls;
    private Integer isAnonymous;
    private Integer likeCount;
    private Integer commentCount;
    private Integer auditStatus;
    private String auditReason;
    private Integer status;
}
