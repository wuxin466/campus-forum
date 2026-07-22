package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("news")
public class News extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long authorId;
    private String title;
    private String summary;
    private String content;
    private String coverUrl;
    private String source;
    private Integer viewCount;
    private Integer isTop;
    private Integer status;
    private LocalDateTime publishedAt;
}
