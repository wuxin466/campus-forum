package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("admin_audit_log")
public class AdminAuditLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long adminId;
    private String action;
    private String bizType;
    private Long bizId;
    private Integer result;
    private String detail;
    private String ipAddress;
    private LocalDateTime createdAt;
}
