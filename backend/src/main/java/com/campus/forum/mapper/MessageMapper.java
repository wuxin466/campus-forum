package com.campus.forum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.forum.entity.Message;
import java.util.List;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface MessageMapper extends BaseMapper<Message> {
    @Select("""
            SELECT m.* FROM message m
            INNER JOIN (
              SELECT LEAST(sender_id,receiver_id) user_a, GREATEST(sender_id,receiver_id) user_b, MAX(id) max_id
              FROM message
              WHERE (sender_id=#{userId} AND deleted_by_sender=0)
                 OR (receiver_id=#{userId} AND deleted_by_receiver=0)
              GROUP BY LEAST(sender_id,receiver_id), GREATEST(sender_id,receiver_id)
            ) latest ON m.id=latest.max_id
            ORDER BY m.created_at DESC
            """)
    List<Message> selectLatestConversations(@Param("userId") long userId);

    @Select("SELECT COUNT(*) FROM message WHERE receiver_id=#{userId} AND is_read=0 AND deleted_by_receiver=0")
    long countUnread(@Param("userId") long userId);

    @Select("SELECT COUNT(*) FROM message WHERE sender_id=#{otherId} AND receiver_id=#{userId} " +
            "AND is_read=0 AND deleted_by_receiver=0")
    long countConversationUnread(@Param("userId") long userId, @Param("otherId") long otherId);

    @Update("UPDATE message SET is_read=1,read_at=NOW() WHERE sender_id=#{otherId} " +
            "AND receiver_id=#{userId} AND is_read=0")
    int markConversationRead(@Param("userId") long userId, @Param("otherId") long otherId);
}
