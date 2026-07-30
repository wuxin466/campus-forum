package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@TableName("campus_verification")
public class CampusVerification {
    @TableId(type = IdType.AUTO) private Long id;
    private Long userId;
    private String realName;
    private String studentNo;
    private String college;
    private String credentialUrl;
    private Integer status;
    private String rejectReason;
    private Long reviewerId;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
