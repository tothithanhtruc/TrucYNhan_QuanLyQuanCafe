
package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Category;

import java.util.List;

public interface CategoryService {

    // Thêm danh mục
    Category create(Category category);

    // Lấy danh sách danh mục
    List<Category> getAllCategories();

    // Lấy danh mục theo ID
    Category getCategoryById(Long id);

    // Cập nhật danh mục
    Category update(Long id, Category category);

    // Xóa danh mục
    void delete(Long id);
}
