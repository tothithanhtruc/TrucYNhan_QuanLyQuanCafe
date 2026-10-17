package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.IngredientRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.IngredientResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.service.IngredientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    public IngredientController(IngredientService ingredientService) {
        this.ingredientService = ingredientService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<IngredientResponse> ingredients = ingredientService.getAll();
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách nguyên liệu thành công",
                "data", ingredients
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        IngredientResponse ingredient = ingredientService.getById(id);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin nguyên liệu thành công",
                "data", ingredient
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody IngredientRequest request) {
        IngredientResponse created = ingredientService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Thêm nguyên liệu thành công",
                "data", created
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody IngredientRequest request) {
        IngredientResponse updated = ingredientService.update(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật nguyên liệu thành công",
                "data", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        ingredientService.delete(id);
        return ResponseEntity.ok(Map.of(
                "message", "Xóa nguyên liệu thành công"
        ));
    }
}
