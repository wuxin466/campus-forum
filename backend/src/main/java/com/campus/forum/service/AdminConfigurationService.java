package com.campus.forum.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.campus.forum.dto.admin.CategoryManageRequest;
import com.campus.forum.dto.admin.SensitiveWordRequest;
import com.campus.forum.entity.ForumCategory;
import com.campus.forum.entity.SensitiveWord;
import com.campus.forum.exception.BusinessException;
import com.campus.forum.mapper.ForumCategoryMapper;
import com.campus.forum.mapper.SensitiveWordMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminConfigurationService {
    private final ForumCategoryMapper categoryMapper;
    private final SensitiveWordMapper sensitiveWordMapper;

    public List<ForumCategory> categories() {
        return categoryMapper.selectList(Wrappers.<ForumCategory>lambdaQuery().orderByAsc(ForumCategory::getSortNo));
    }

    @Transactional
    public long saveCategory(Long id, CategoryManageRequest request) {
        ForumCategory item = id == null ? new ForumCategory() : categoryMapper.selectById(id);
        if (item == null) throw new BusinessException(404, "板块不存在");
        item.setName(request.name().trim()); item.setCode(request.code().trim());
        item.setDescription(request.description()); item.setSortNo(request.sortNo()); item.setStatus(request.status());
        if (id == null) { item.setDeleted(0); categoryMapper.insert(item); } else categoryMapper.updateById(item);
        return item.getId();
    }

    public List<SensitiveWord> sensitiveWords() {
        return sensitiveWordMapper.selectList(Wrappers.<SensitiveWord>lambdaQuery().orderByDesc(SensitiveWord::getId));
    }

    @Transactional
    public long saveSensitiveWord(Long id, SensitiveWordRequest request) {
        SensitiveWord item = id == null ? new SensitiveWord() : sensitiveWordMapper.selectById(id);
        if (item == null) throw new BusinessException(404, "敏感词不存在");
        item.setWord(request.word().trim()); item.setLevel(request.level()); item.setStatus(request.status());
        if (id == null) { item.setDeleted(0); sensitiveWordMapper.insert(item); } else sensitiveWordMapper.updateById(item);
        return item.getId();
    }

    public void deleteSensitiveWord(long id) {
        if (sensitiveWordMapper.selectById(id) == null) throw new BusinessException(404, "敏感词不存在");
        sensitiveWordMapper.deleteById(id);
    }
}
