package com.campus.forum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.forum.entity.Confess;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

public interface ConfessMapper extends BaseMapper<Confess> {
    @Update("UPDATE confess SET like_count=GREATEST(0,like_count+#{delta}) WHERE id=#{id} AND deleted=0")
    int changeLikeCount(@Param("id") long id, @Param("delta") int delta);

    @Update("UPDATE confess SET comment_count=comment_count+1 WHERE id=#{id} AND deleted=0")
    int incrementCommentCount(@Param("id") long id);
}
