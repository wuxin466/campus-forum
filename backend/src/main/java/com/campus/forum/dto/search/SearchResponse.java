package com.campus.forum.dto.search;

import com.campus.forum.dto.activity.ActivityResponse;
import com.campus.forum.dto.confess.ConfessResponse;
import com.campus.forum.dto.forum.PostResponse;
import com.campus.forum.dto.user.PublicUserResponse;
import java.util.List;
import com.campus.forum.common.PageResponse;
import com.campus.forum.dto.news.NewsResponse;
import com.campus.forum.dto.news.NoticeResponse;

public record SearchResponse(PageResponse<PostResponse> posts,
                             PageResponse<ConfessResponse> confesses,
                             PageResponse<ActivityResponse> activities,
                             PageResponse<PublicUserResponse> users,
                             PageResponse<NewsResponse> news,
                             PageResponse<NoticeResponse> notices) {}
