package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.BannerRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.BannerResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.service.BannerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/banners")
public class BannerController {

    private final BannerService bannerService;

    public BannerController(BannerService bannerService) {
        this.bannerService = bannerService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<BannerResponse> banners = bannerService.getAll();
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách banner thành công",
                "data", banners
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        BannerResponse banner = bannerService.getById(id);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin banner thành công",
                "data", banner
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody BannerRequest request) {
        BannerResponse created = bannerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Thêm banner thành công",
                "data", created
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody BannerRequest request) {
        BannerResponse updated = bannerService.update(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật banner thành công",
                "data", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        bannerService.delete(id);
        return ResponseEntity.ok(Map.of(
                "message", "Xóa banner thành công"
        ));
    }
}
