package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("forum_comment")
public class ForumComment extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Integer bizType;
    private Long bizId;
    private Long parentId;
    private Long rootId;
    private Long userId;
    private Long replyUserId;
    private String content;
    private Integer likeCount;
    private Integer auditStatus;
}
