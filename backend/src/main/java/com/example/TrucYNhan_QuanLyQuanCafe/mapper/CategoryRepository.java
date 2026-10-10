package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Category;
import java.util.List;

public interface CategoryRepository {

    Category save(Category category);

    List<Category> findAll();

    boolean existsById(Long id);
}
