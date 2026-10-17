package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.PaymentRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.PaymentResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<PaymentResponse> list = paymentService.findAll();
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách thanh toán thành công",
                "data", list
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        PaymentResponse response = paymentService.findById(id);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin thanh toán thành công",
                "data", response
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse created = paymentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Tạo giao dịch thanh toán thành công",
                "data", created
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        PaymentResponse updated = paymentService.update(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật thanh toán thành công",
                "data", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        paymentService.delete(id);
        return ResponseEntity.ok(Map.of(
                "message", "Xóa thanh toán thành công"
        ));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Map<String, Object>> getByOrderId(@PathVariable Long orderId) {
        List<PaymentResponse> list = paymentService.findByOrderId(orderId);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách thanh toán theo đơn hàng thành công",
                "data", list
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getByStatus(@RequestParam String status) {
        List<PaymentResponse> list = paymentService.findByStatus(status);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách thanh toán theo trạng thái thành công",
                "data", list
        ));
    }
}
