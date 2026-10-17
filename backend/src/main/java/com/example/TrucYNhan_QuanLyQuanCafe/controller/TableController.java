package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.TableRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.TableResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.service.TableService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<TableResponse> tables = tableService.getAll();
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách bàn thành công",
                "data", tables
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        TableResponse table = tableService.getById(id);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin bàn thành công",
                "data", table
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody TableRequest request) {
        TableResponse created = tableService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Thêm bàn thành công",
                "data", created
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody TableRequest request) {
        TableResponse updated = tableService.update(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật bàn thành công",
                "data", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        tableService.delete(id);
        return ResponseEntity.ok(Map.of(
                "message", "Xóa bàn thành công"
        ));
    }
}
