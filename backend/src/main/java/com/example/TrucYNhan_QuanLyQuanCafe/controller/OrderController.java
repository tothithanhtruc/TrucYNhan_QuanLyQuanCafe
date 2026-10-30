package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.OrderRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.OrderResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.CheckoutRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<OrderResponse> orders = orderService.getAll();
        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách đơn hàng thành công",
                "data", orders
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        OrderResponse order = orderService.getById(id);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin đơn hàng thành công",
                "data", order
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody OrderRequest request) {
        OrderResponse created = orderService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Tạo đơn hàng thành công",
                "data", created
        ));
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, Object>> checkout(
            @Valid @RequestBody CheckoutRequest request,
            Authentication authentication) {
        OrderResponse created = orderService.checkout(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Đặt hàng thành công",
                "data", created
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody OrderRequest request) {
        OrderResponse updated = orderService.update(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật đơn hàng thành công",
                "data", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        orderService.delete(id);
        return ResponseEntity.ok(Map.of(
                "message", "Xóa đơn hàng thành công"
        ));
    }

    @GetMapping("/trash")
    public ResponseEntity<Map<String, Object>> getDeleted() {
        return ResponseEntity.ok(Map.of("data", orderService.getDeleted()));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<Map<String, Object>> restore(@PathVariable Long id) {
        orderService.restore(id);
        return ResponseEntity.ok(Map.of("message", "Khôi phục đơn hàng thành công"));
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Map<String, Object>> permanentlyDelete(@PathVariable Long id) {
        orderService.permanentlyDelete(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa vĩnh viễn đơn hàng"));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getByStatus(@RequestParam String status) {
        List<OrderResponse> orders = orderService.getByStatus(status);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy đơn hàng theo trạng thái thành công",
                "data", orders
        ));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getByUserId(@PathVariable Long userId) {
        List<OrderResponse> orders = orderService.getByUserId(userId);
        return ResponseEntity.ok(Map.of(
                "message", "Lấy đơn hàng theo người dùng thành công",
                "data", orders
        ));
    }
}
