package com.campus.forum.service;

import com.campus.forum.dto.activity.ActivityResponse;
import com.campus.forum.dto.forum.PostResponse;
import com.campus.forum.dto.home.HomeResponse;
import com.campus.forum.dto.home.HotTopicResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HomeService {
    private final ForumService forumService;
    private final ActivityService activityService;

    public HomeResponse home(Long currentUserId) {
        List<PostResponse> posts = forumService.posts(1, 10, null, null, "latest", currentUserId).records();
        List<ActivityResponse> activities = activityService.upcoming(1, 3, null, null, currentUserId).records();
        List<HotTopicResponse> hotTopics = forumService.posts(1, 5, null, null, "hot", currentUserId).records()
                .stream().map(post -> new HotTopicResponse(post.id(), post.title(),
                        post.likes() * 3 + post.comments() * 5 + post.views())).toList();
        return new HomeResponse(posts, activities, hotTopics);
    }
}
