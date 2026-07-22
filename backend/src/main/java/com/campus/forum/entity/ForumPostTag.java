package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("forum_post_tag")
public class ForumPostTag {
    private Long postId;
    private Long tagId;
}
