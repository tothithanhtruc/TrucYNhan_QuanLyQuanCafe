package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.PromotionRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.PromotionResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<PromotionResponse> promotions = promotionService.getAll();
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách khuyến mãi thành công",
                "data", promotions
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        PromotionResponse promotion = promotionService.getById(id);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin khuyến mãi thành công",
                "data", promotion
        ));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Map<String, Object>> getByCode(@PathVariable String code) {
        PromotionResponse promotion = promotionService.getByCode(code);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin khuyến mãi theo mã thành công",
                "data", promotion
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody PromotionRequest request) {
        PromotionResponse created = promotionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Thêm khuyến mãi thành công",
                "data", created
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody PromotionRequest request) {
        PromotionResponse updated = promotionService.update(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật khuyến mãi thành công",
                "data", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        promotionService.delete(id);
        return ResponseEntity.ok(Map.of(
                "message", "Xóa khuyến mãi thành công"
        ));
    }
}
