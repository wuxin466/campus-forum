package com.campus.forum.service;

import com.campus.forum.dto.search.SearchResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SearchService {
    private final ForumService forumService;
    private final ConfessService confessService;
    private final ActivityService activityService;
    private final UserService userService;
    private final NewsService newsService;

    public SearchResponse search(String keyword, long page, long size, Long currentUserId) {
        if (!StringUtils.hasText(keyword)) {
            return new SearchResponse(
                    new com.campus.forum.common.PageResponse<>(List.of(), 0, page, size, 0),
                    new com.campus.forum.common.PageResponse<>(List.of(), 0, page, size, 0),
                    new com.campus.forum.common.PageResponse<>(List.of(), 0, page, size, 0),
                    new com.campus.forum.common.PageResponse<>(List.of(), 0, page, size, 0),
                    new com.campus.forum.common.PageResponse<>(List.of(), 0, page, size, 0),
                    new com.campus.forum.common.PageResponse<>(List.of(), 0, page, size, 0));
        }
        String value = keyword.trim();
        return new SearchResponse(
                forumService.posts(page, size, null, value, "latest", currentUserId),
                confessService.search(page, size, value, currentUserId),
                activityService.upcoming(page, size, null, value, currentUserId),
                userService.publicSearchPage(currentUserId, value, page, size),
                newsService.news(page, size, value),
                newsService.notices(page, size, value)
        );
    }
}
