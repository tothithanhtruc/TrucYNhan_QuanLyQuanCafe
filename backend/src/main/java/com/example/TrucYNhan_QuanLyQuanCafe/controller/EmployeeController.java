
package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Employee;
import com.example.TrucYNhan_QuanLyQuanCafe.service.EmployeeService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
//import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:3000")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // 1. Lấy danh sách nhân viên
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(
                employeeService.getAllEmployees());
    }

    // 2. Lấy chi tiết nhân viên
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                employeeService.getEmployeeById(id));
    }

    // 3. Tìm nhân viên theo tên
    @GetMapping("/search")
    public ResponseEntity<List<Employee>> searchEmployees(
            @RequestParam(required = false) String name) {
        return ResponseEntity.ok(
                employeeService.searchEmployees(name));
    }

    // 4. Thêm nhân viên
    @PostMapping
    public ResponseEntity<Map<String, Object>> createEmployee(
            @RequestBody Employee employee) {

        Employee created = employeeService.createEmployee(employee);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Thêm nhân viên thành công!");
        response.put("data", created);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    // 5. Cập nhật nhân viên
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee) {

        Employee updated = employeeService.updateEmployee(id, employee);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Cập nhật nhân viên thành công!");
        response.put("data", updated);

        return ResponseEntity.ok(response);
    }

    // 6. Xóa nhân viên
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteEmployee(
            @PathVariable Long id) {

        employeeService.deleteEmployee(id);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Xóa nhân viên thành công!");

        return ResponseEntity.ok(response);
    }
}
