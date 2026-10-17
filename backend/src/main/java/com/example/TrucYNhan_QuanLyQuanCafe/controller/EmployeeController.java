package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.EmployeeRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.EmployeeResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<EmployeeResponse> employees = employeeService.getAll();
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách nhân viên thành công",
                "data", employees
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        EmployeeResponse employee = employeeService.getById(id);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin nhân viên thành công",
                "data", employee
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse created = employeeService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Thêm nhân viên thành công",
                "data", created
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse updated = employeeService.update(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật nhân viên thành công",
                "data", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.ok(Map.of(
                "message", "Xóa nhân viên thành công"
        ));
    }
}
