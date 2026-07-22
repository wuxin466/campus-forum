package com.campus.forum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.forum.entity.ForumPost;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

public interface ForumPostMapper extends BaseMapper<ForumPost> {
    @Update("UPDATE forum_post SET view_count = view_count + 1 WHERE id = #{id} AND deleted = 0")
    int incrementViewCount(@Param("id") long id);

    @Update("UPDATE forum_post SET like_count = GREATEST(0, like_count + #{delta}) WHERE id = #{id} AND deleted = 0")
    int changeLikeCount(@Param("id") long id, @Param("delta") int delta);

    @Update("UPDATE forum_post SET collect_count = GREATEST(0, collect_count + #{delta}) WHERE id = #{id} AND deleted = 0")
    int changeCollectCount(@Param("id") long id, @Param("delta") int delta);

    @Update("UPDATE forum_post SET comment_count = comment_count + 1 WHERE id = #{id} AND deleted = 0")
    int incrementCommentCount(@Param("id") long id);
}
