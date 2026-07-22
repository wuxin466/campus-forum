package com.campus.forum.dto.report;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record HandleReportRequest(
        @Min(2) @Max(3) int status,
        @NotBlank @Size(max = 500) String result) {}
