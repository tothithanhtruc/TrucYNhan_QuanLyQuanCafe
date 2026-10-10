
package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.CategoryRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.CategoryResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.CategoryMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.service.CategoryService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    public CategoryController(
            CategoryService categoryService,
            CategoryMapper categoryMapper) {
        this.categoryService = categoryService;
        this.categoryMapper = categoryMapper;
    }

    // GET: Lấy tất cả danh mục
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCategories() {
        List<CategoryResponse> categories =
                categoryService.getAllCategories()
                        .stream()
                        .map(categoryMapper::toResponse)
                        .toList();

        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách danh mục thành công",
                "data", categories
        ));
    }

    // GET: Lấy danh mục theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCategoryById(
            @PathVariable Long id) {

        CategoryResponse category = categoryMapper.toResponse(
                categoryService.getCategoryById(id)
        );

        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin danh mục thành công",
                "data", category
        ));
    }

    // POST: Thêm danh mục
    @PostMapping
    public ResponseEntity<Map<String, Object>> addCategory(
            @Valid @RequestBody CategoryRequest request) {

        CategoryResponse category = categoryMapper.toResponse(
                categoryService.create(categoryMapper.toEntity(request))
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Thêm danh mục thành công",
                "data", category
        ));
    }

    // PUT: Cập nhật danh mục
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {

        CategoryResponse category = categoryMapper.toResponse(
                categoryService.update(id, categoryMapper.toEntity(request))
        );

        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật danh mục thành công",
                "data", category
        ));
    }

    // DELETE: Xóa danh mục
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCategory(
            @PathVariable Long id) {

        categoryService.delete(id);

        return ResponseEntity.ok(Map.of(
                "message", "Xóa danh mục thành công"
        ));
    }
}
