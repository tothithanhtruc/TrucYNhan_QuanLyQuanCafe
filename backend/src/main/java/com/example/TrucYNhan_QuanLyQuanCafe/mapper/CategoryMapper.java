package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.CategoryRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.CategoryResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryRequest request) {
        if (request == null) {
            return null;
        }

        Category category = new Category();
        category.setName(request.name());
        category.setAlias(request.alias());
        category.setImage(request.image());
        category.setParentId(request.parentId());
        category.setDescription(request.description());
        category.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
        category.setStatus(request.status() != null ? request.status() : 1);

        return category;
    }

    public CategoryResponse toResponse(Category category) {
        if (category == null) {
            return null;
        }

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getAlias(),
                category.getImage(),
                category.getParentId(),
                category.getDescription(),
                category.getSortOrder(),
                category.getStatus()
        );
    }
}
