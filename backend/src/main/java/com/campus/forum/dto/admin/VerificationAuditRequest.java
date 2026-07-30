package com.campus.forum.dto.admin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
public record VerificationAuditRequest(@Min(1) @Max(2) int status, @Size(max=255) String reason) {}
