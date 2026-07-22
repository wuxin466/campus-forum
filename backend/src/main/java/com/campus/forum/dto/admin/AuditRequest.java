package com.campus.forum.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record AuditRequest(
        @Min(value = 1, message = "审核状态只能为1或2")
        @Max(value = 2, message = "审核状态只能为1或2") int status,
        @Size(max = 255, message = "审核原因不能超过255个字符") String reason) {}
