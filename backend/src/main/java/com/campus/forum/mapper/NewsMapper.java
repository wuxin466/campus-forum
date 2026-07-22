package com.campus.forum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.forum.entity.News;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

public interface NewsMapper extends BaseMapper<News> {
    @Update("UPDATE news SET view_count=view_count+1 WHERE id=#{id} AND deleted=0")
    int incrementView(@Param("id") long id);
}
