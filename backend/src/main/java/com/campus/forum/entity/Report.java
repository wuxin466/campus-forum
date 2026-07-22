package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("report")
public class Report {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long reporterId;
    private Integer bizType;
    private Long bizId;
    private Integer reasonType;
    private String description;
    private String evidenceUrls;
    private Integer status;
    private Long handlerId;
    private String handleResult;
    private LocalDateTime handledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
