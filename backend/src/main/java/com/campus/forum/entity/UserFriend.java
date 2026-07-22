package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("user_friend")
public class UserFriend {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long requesterId;
    private Long addresseeId;
    private Integer status;
    private String remark;
    private LocalDateTime appliedAt;
    private LocalDateTime handledAt;
    private LocalDateTime updatedAt;
}
