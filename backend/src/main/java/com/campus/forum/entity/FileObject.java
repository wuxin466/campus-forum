package com.campus.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@TableName("file_object")
public class FileObject {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long uploaderId;
    private String bucketName;
    private String objectKey;
    private String originalName;
    private String contentType;
    private Long fileSize;
    private String sha256;
    private Integer accessType;
    private Integer status;
    private LocalDateTime createdAt;
    @TableLogic
    private Integer deleted;
}
