package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("activity_category")
public class ActivityCategory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String code;
    private Integer sortNo;
    private Integer status;
    private LocalDateTime createdAt;
}
