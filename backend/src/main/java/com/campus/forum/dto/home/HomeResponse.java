package com.campus.forum.dto.home;

import com.campus.forum.dto.activity.ActivityResponse;
import com.campus.forum.dto.forum.PostResponse;
import java.util.List;

public record HomeResponse(List<PostResponse> posts, List<ActivityResponse> activities,
                           List<HotTopicResponse> hotTopics) {}
