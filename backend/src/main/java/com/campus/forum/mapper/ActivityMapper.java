package com.campus.forum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.forum.entity.Activity;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

public interface ActivityMapper extends BaseMapper<Activity> {
    @Update("UPDATE activity SET view_count=view_count+1 WHERE id=#{id} AND deleted=0")
    int incrementView(@Param("id") long id);

    @Update("UPDATE activity SET signed_count=signed_count+1, " +
            "status=IF(signed_count+1>=capacity,2,status) " +
            "WHERE id=#{id} AND deleted=0 AND audit_status=1 AND status=1 " +
            "AND signed_count<capacity AND signup_deadline>NOW()")
    int reserveSeat(@Param("id") long id);

    @Update("UPDATE activity SET signed_count=GREATEST(0,signed_count-1), " +
            "status=IF(status=2,1,status) WHERE id=#{id} AND deleted=0")
    int releaseSeat(@Param("id") long id);
}
