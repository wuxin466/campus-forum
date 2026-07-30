package com.campus.forum.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.news.NewsResponse;
import com.campus.forum.dto.news.NoticeResponse;
import com.campus.forum.entity.News;
import com.campus.forum.entity.SystemNotice;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.NewsMapper;
import com.campus.forum.mapper.SystemNoticeMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class NewsService {
    private final NewsMapper newsMapper;
    private final SystemNoticeMapper noticeMapper;

    public PageResponse<NewsResponse> news(long page, long size, String keyword) {
        IPage<News> result = newsMapper.selectPage(Page.of(page, size),
                Wrappers.<News>lambdaQuery().eq(News::getStatus, 1)
                        .and(StringUtils.hasText(keyword), query -> query.like(News::getTitle, keyword)
                                .or().like(News::getSummary, keyword))
                        .orderByDesc(News::getIsTop, News::getPublishedAt));
        List<NewsResponse> records = result.getRecords().stream().map(item -> toNews(item, false)).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    @Transactional
    public NewsResponse detail(long id) {
        News news = newsMapper.selectOne(Wrappers.<News>lambdaQuery().eq(News::getId, id).eq(News::getStatus, 1));
        if (news == null) throw new BusinessException(404, "校园资讯不存在或已下架");
        newsMapper.incrementView(id);
        news.setViewCount(news.getViewCount() + 1);
        return toNews(news, true);
    }

    public PageResponse<NoticeResponse> notices(long page, long size) { return notices(page, size, null); }

    public PageResponse<NoticeResponse> notices(long page, long size, String keyword) {
        IPage<SystemNotice> result = noticeMapper.selectPage(Page.of(page, size),
                Wrappers.<SystemNotice>lambdaQuery().eq(SystemNotice::getStatus, 1)
                        .and(StringUtils.hasText(keyword), q -> q.like(SystemNotice::getTitle, keyword).or().like(SystemNotice::getContent, keyword))
                        .orderByDesc(SystemNotice::getIsTop, SystemNotice::getPublishedAt));
        List<NoticeResponse> records = result.getRecords().stream().map(this::toNotice).toList();
        return new PageResponse<>(records, result.getTotal(), result.getCurrent(), result.getSize(), result.getPages());
    }

    public NoticeResponse noticeDetail(long id) {
        SystemNotice notice = noticeMapper.selectOne(Wrappers.<SystemNotice>lambdaQuery()
                .eq(SystemNotice::getId, id).eq(SystemNotice::getStatus, 1));
        if (notice == null) throw new BusinessException(404, "系统公告不存在或已下架");
        return toNotice(notice);
    }

    private NewsResponse toNews(News item, boolean detail) {
        return new NewsResponse(item.getId(), item.getTitle(), item.getSummary(), detail ? item.getContent() : null,
                item.getCoverUrl(), item.getSource(), item.getViewCount(), item.getIsTop() == 1, item.getPublishedAt());
    }

    private NoticeResponse toNotice(SystemNotice item) {
        return new NoticeResponse(item.getId(), item.getTitle(), item.getContent(), item.getIsTop() == 1,
                item.getPublishedAt());
    }
}
