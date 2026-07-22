package com.campus.forum.dto.report;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateReportRequest(
        @Min(1) @Max(6) int bizType,
        @NotNull Long bizId,
        @Min(1) @Max(20) int reasonType,
        @Size(max = 500) String description,
        @Size(max = 9) List<@Size(max = 500) String> evidenceUrls) {}
