package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("sensitive_word")
public class SensitiveWord extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String word;
    private Integer level;
    private Integer status;
}
