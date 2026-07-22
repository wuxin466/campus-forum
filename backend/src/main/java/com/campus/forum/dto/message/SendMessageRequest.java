package com.campus.forum.dto.message;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        @Min(0) @Max(2) int messageType,
        @Size(max = 5000, message = "消息内容不能超过5000个字符") String content,
        @Size(max = 500, message = "文件地址不能超过500个字符") String fileUrl) {}
