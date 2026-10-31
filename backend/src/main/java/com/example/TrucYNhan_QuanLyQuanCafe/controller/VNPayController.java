package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.VNPayCreatePaymentRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.VNPayResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment/vnpay")
public class VNPayController {

    private final VNPayService vnPayService;

    public VNPayController(VNPayService vnPayService) {
        this.vnPayService = vnPayService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createPaymentUrl(
            @Valid @RequestBody VNPayCreatePaymentRequest request,
            HttpServletRequest httpRequest) {
        String paymentUrl = vnPayService.createPaymentUrl(request.orderCode(), request.bankCode(), httpRequest);
        return ResponseEntity.ok(Map.of(
                "message", "Tạo liên kết thanh toán VNPAY thành công",
                "paymentUrl", paymentUrl
        ));
    }

    @PostMapping("/simulate-success")
    public ResponseEntity<Map<String, Object>> simulateSuccess(@RequestBody Map<String, String> payload) {
        String orderCode = payload.get("orderCode");
        String bankCode = payload.get("bankCode");
        String cardNumber = payload.get("cardNumber");
        String cardHolder = payload.get("cardHolder");
        Map<String, Object> result = vnPayService.simulatePaymentSuccess(orderCode, bankCode, cardNumber, cardHolder);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/callback")
    public ResponseEntity<VNPayResponse> callback(@RequestParam Map<String, String> allParams) {
        VNPayResponse response = vnPayService.verifyPayment(allParams);
        return ResponseEntity.ok(response);
    }
}
