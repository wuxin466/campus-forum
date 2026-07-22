package com.campus.forum.dto.report;

import java.time.LocalDateTime;
import java.util.List;

public record ReportResponse(Long id, Long reporterId, String reporterName, int bizType, Long bizId,
                             int reasonType, String description, List<String> evidenceUrls,
                             int status, Long handlerId, String handleResult,
                             LocalDateTime handledAt, LocalDateTime createdAt) {}
