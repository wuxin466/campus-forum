package com.campus.forum.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.campus.forum.dto.admin.BannerRequest;
import com.campus.forum.dto.admin.NewsManageRequest;
import com.campus.forum.dto.admin.NoticeManageRequest;
import com.campus.forum.dto.news.BannerResponse;
import com.campus.forum.entity.Banner;
import com.campus.forum.entity.News;
import com.campus.forum.entity.SystemNotice;
import com.campus.forum.common.PageResponse;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.BannerMapper;
import com.campus.forum.mapper.NewsMapper;
import com.campus.forum.mapper.SystemNoticeMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ContentAdminService {
    private final NewsMapper newsMapper;
    private final SystemNoticeMapper noticeMapper;
    private final BannerMapper bannerMapper;

    public PageResponse<News> news(long page, long size) {
        return PageResponse.from(newsMapper.selectPage(Page.of(page, size), Wrappers.<News>lambdaQuery().orderByDesc(News::getId)));
    }

    public PageResponse<SystemNotice> notices(long page, long size) {
        return PageResponse.from(noticeMapper.selectPage(Page.of(page, size), Wrappers.<SystemNotice>lambdaQuery().orderByDesc(SystemNotice::getId)));
    }

    public List<Banner> bannersForAdmin() {
        return bannerMapper.selectList(Wrappers.<Banner>lambdaQuery().orderByAsc(Banner::getSortNo));
    }

    @Transactional
    public long createNews(long adminId, NewsManageRequest request) {
        News news = new News();
        news.setAuthorId(adminId); apply(news, request); news.setViewCount(0); news.setStatus(0); news.setDeleted(0);
        newsMapper.insert(news);
        return news.getId();
    }

    @Transactional
    public void updateNews(long id, NewsManageRequest request) {
        News news = requireNews(id); apply(news, request); newsMapper.updateById(news);
    }

    @Transactional
    public void setNewsPublished(long id, boolean publish) {
        News news = requireNews(id); news.setStatus(publish ? 1 : 2);
        if (publish && news.getPublishedAt() == null) news.setPublishedAt(LocalDateTime.now());
        newsMapper.updateById(news);
    }

    @Transactional
    public long createNotice(long adminId, NoticeManageRequest request) {
        SystemNotice notice = new SystemNotice();
        notice.setPublisherId(adminId); apply(notice, request); notice.setStatus(0); notice.setDeleted(0);
        noticeMapper.insert(notice);
        return notice.getId();
    }

    @Transactional
    public void updateNotice(long id, NoticeManageRequest request) {
        SystemNotice notice = requireNotice(id); apply(notice, request); noticeMapper.updateById(notice);
    }

    @Transactional
    public void setNoticePublished(long id, boolean publish) {
        SystemNotice notice = requireNotice(id); notice.setStatus(publish ? 1 : 2);
        if (publish && notice.getPublishedAt() == null) notice.setPublishedAt(LocalDateTime.now());
        noticeMapper.updateById(notice);
    }

    @Transactional
    public long createBanner(BannerRequest request) {
        validateTime(request);
        Banner banner = new Banner(); apply(banner, request); banner.setStatus(1); banner.setDeleted(0);
        banner.setCreatedAt(LocalDateTime.now()); banner.setUpdatedAt(LocalDateTime.now());
        bannerMapper.insert(banner);
        return banner.getId();
    }

    @Transactional
    public void updateBanner(long id, BannerRequest request) {
        validateTime(request);
        Banner banner = bannerMapper.selectById(id);
        if (banner == null) throw new BusinessException(404, "轮播图不存在");
        apply(banner, request); banner.setUpdatedAt(LocalDateTime.now()); bannerMapper.updateById(banner);
    }

    @Transactional
    public void deleteBanner(long id) {
        if (bannerMapper.selectById(id) == null) throw new BusinessException(404, "轮播图不存在");
        bannerMapper.deleteById(id);
    }

    public List<BannerResponse> activeBanners() {
        LocalDateTime now = LocalDateTime.now();
        return bannerMapper.selectList(Wrappers.<Banner>lambdaQuery().eq(Banner::getStatus, 1)
                        .le(Banner::getStartAt, now).ge(Banner::getEndAt, now).orderByAsc(Banner::getSortNo))
                .stream().map(item -> new BannerResponse(item.getId(), item.getTitle(), item.getImageUrl(),
                        item.getLinkUrl(), item.getSortNo(), item.getStartAt(), item.getEndAt())).toList();
    }

    private void apply(News news, NewsManageRequest request) {
        news.setTitle(request.title().trim()); news.setSummary(trim(request.summary()));
        news.setContent(request.content().trim()); news.setCoverUrl(trim(request.coverUrl()));
        news.setSource(trim(request.source())); news.setIsTop(request.top() ? 1 : 0);
    }

    private void apply(SystemNotice notice, NoticeManageRequest request) {
        notice.setTitle(request.title().trim()); notice.setContent(request.content().trim());
        notice.setTargetType(request.targetType()); notice.setIsTop(request.top() ? 1 : 0);
    }

    private void apply(Banner banner, BannerRequest request) {
        banner.setTitle(request.title().trim()); banner.setImageUrl(request.imageUrl().trim());
        banner.setLinkUrl(trim(request.linkUrl())); banner.setSortNo(request.sortNo());
        banner.setStartAt(request.startAt()); banner.setEndAt(request.endAt());
    }

    private News requireNews(long id) {
        News news = newsMapper.selectById(id);
        if (news == null) throw new BusinessException(404, "资讯不存在");
        return news;
    }

    private SystemNotice requireNotice(long id) {
        SystemNotice notice = noticeMapper.selectById(id);
        if (notice == null) throw new BusinessException(404, "公告不存在");
        return notice;
    }

    private void validateTime(BannerRequest request) {
        if (!request.endAt().isAfter(request.startAt())) throw BusinessException.badRequest("轮播结束时间必须晚于开始时间");
    }

    private String trim(String value) { return StringUtils.hasText(value) ? value.trim() : null; }
}
