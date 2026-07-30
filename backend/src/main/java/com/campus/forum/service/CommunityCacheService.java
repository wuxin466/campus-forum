package com.campus.forum.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor
public class CommunityCacheService {
    private final StringRedisTemplate redis;
    private final ObjectMapper mapper;
    @Value("${campus.infrastructure.redis-enabled:true}") private boolean enabled;
    public <T> T get(String key, Class<T> type) { if(!enabled)return null; try { String value=redis.opsForValue().get(key); return value==null?null:mapper.readValue(value,type); } catch(Exception ignored){return null;} }
    public void put(String key,Object value,Duration ttl){ if(!enabled)return; try{redis.opsForValue().set(key,mapper.writeValueAsString(value),ttl);}catch(Exception ignored){} }
    public void evict(String key){if(!enabled)return;try{redis.delete(key);}catch(Exception ignored){}}
    public void recordLike(String type,long id,int count){if(!enabled)return;try{redis.opsForZSet().add("campus:likes:"+type,String.valueOf(id),count);}catch(Exception ignored){}}
}
