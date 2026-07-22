package com.campus.forum.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.report.CreateReportRequest;
import com.campus.forum.dto.report.HandleReportRequest;
import com.campus.forum.dto.report.ReportResponse;
import com.campus.forum.entity.AdminAuditLog;
import com.campus.forum.entity.Message;
import com.campus.forum.entity.Report;
import com.campus.forum.entity.User;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.ActivityMapper;
import com.campus.forum.mapper.AdminAuditLogMapper;
import com.campus.forum.mapper.ConfessMapper;
import com.campus.forum.mapper.ForumCommentMapper;
import com.campus.forum.mapper.ForumPostMapper;
import com.campus.forum.mapper.MessageMapper;
import com.campus.forum.mapper.ReportMapper;
import com.campus.forum.mapper.UserMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportMapper reportMapper;
    private final UserMapper userMapper;
    private final ForumPostMapper postMapper;
    private final ConfessMapper confessMapper;
    private final ForumCommentMapper commentMapper;
    private final ActivityMapper activityMapper;
    private final MessageMapper messageMapper;
    private final AdminAuditLogMapper auditLogMapper;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Transactional
    public ReportResponse create(long reporterId, CreateReportRequest request) {
        validateTarget(reporterId, request.bizType(), request.bizId());
        Report report = new Report();
        report.setReporterId(reporterId); report.setBizType(request.bizType()); report.setBizId(request.bizId());
        report.setReasonType(request.reasonType()); report.setDescription(trimToNull(request.description()));
        report.setEvidenceUrls(writeUrls(request.evidenceUrls() == null ? List.of() : request.evidenceUrls()));
        report.setStatus(0); report.setCreatedAt(LocalDateTime.now()); report.setUpdatedAt(LocalDateTime.now());
        try {
            reportMapper.insert(report);
        } catch (DuplicateKeyException exception) {
            throw BusinessException.badRequest("你已经举报过该内容");
        }
        return toResponse(report);
    }

    public PageResponse<ReportResponse> mine(long userId, long page, long size) {
        IPage<Report> result = reportMapper.selectPage(Page.of(page, size),
                Wrappers.<Report>lambdaQuery().eq(Report::getReporterId, userId)
                        .orderByDesc(Report::getCreatedAt));
        return convert(result);
    }

    public PageResponse<ReportResponse> adminList(long page, long size, Integer status, Integer bizType) {
        IPage<Report> result = reportMapper.selectPage(Page.of(page, size),
                Wrappers.<Report>lambdaQuery().eq(status != null, Report::getStatus, status)
                        .eq(bizType != null, Report::getBizType, bizType)
                        .orderByAsc(Report::getStatus).orderByDesc(Report::getCreatedAt));
        return convert(result);
    }

    @Transactional
    public void handle(long adminId, long reportId, HandleReportRequest request, String ip) {
        Report report = reportMapper.selectById(reportId);
        if (report == null) throw new BusinessException(404, "举报记录不存在");
        if (report.getStatus() == 2 || report.getStatus() == 3) throw BusinessException.badRequest("举报已经处理");
        report.setStatus(request.status()); report.setHandlerId(adminId);
        report.setHandleResult(request.result().trim()); report.setHandledAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        reportMapper.updateById(report);
        notificationService.create(report.getReporterId(), null, 5, "举报处理完成",
                request.result().trim(), 6, reportId);
        AdminAuditLog log = new AdminAuditLog();
        log.setAdminId(adminId); log.setAction(request.status() == 2 ? "REPORT_RESOLVE" : "REPORT_REJECT");
        log.setBizType("REPORT"); log.setBizId(reportId); log.setResult(1);
        log.setDetail(writeDetail(request.result())); log.setIpAddress(ip); log.setCreatedAt(LocalDateTime.now());
        auditLogMapper.insert(log);
    }

    private void validateTarget(long reporterId, int type, long id) {
        boolean exists = switch (type) {
            case 1 -> userMapper.selectById(id) != null && reporterId != id;
            case 2 -> postMapper.selectById(id) != null;
            case 3 -> confessMapper.selectById(id) != null;
            case 4 -> commentMapper.selectById(id) != null;
            case 5 -> activityMapper.selectById(id) != null;
            case 6 -> {
                Message message = messageMapper.selectById(id);
                yield message != null && (message.getSenderId() == reporterId || message.getReceiverId() == reporterId);
            }
            default -> false;
        };
        if (!exists) throw BusinessException.badRequest("举报目标不存在或无权举报");
    }

    private PageResponse<ReportResponse> convert(IPage<Report> page) {
        List<ReportResponse> records = page.getRecords().stream().map(this::toResponse).toList();
        return new PageResponse<>(records, page.getTotal(), page.getCurrent(), page.getSize(), page.getPages());
    }

    private ReportResponse toResponse(Report report) {
        User reporter = userMapper.selectById(report.getReporterId());
        return new ReportResponse(report.getId(), report.getReporterId(),
                reporter == null ? "已注销用户" : reporter.getNickname(), report.getBizType(), report.getBizId(),
                report.getReasonType(), report.getDescription(), readUrls(report.getEvidenceUrls()),
                report.getStatus(), report.getHandlerId(), report.getHandleResult(), report.getHandledAt(),
                report.getCreatedAt());
    }

    private String writeUrls(List<String> urls) {
        try { return objectMapper.writeValueAsString(urls); }
        catch (JsonProcessingException exception) { throw BusinessException.badRequest("举报证据格式错误"); }
    }

    private List<String> readUrls(String value) {
        if (!StringUtils.hasText(value)) return List.of();
        try { return objectMapper.readValue(value, new TypeReference<>() {}); }
        catch (JsonProcessingException exception) { return List.of(); }
    }

    private String writeDetail(String result) {
        try { return objectMapper.writeValueAsString(java.util.Map.of("result", result)); }
        catch (JsonProcessingException exception) { return "{}"; }
    }

    private String trimToNull(String value) { return StringUtils.hasText(value) ? value.trim() : null; }
}
