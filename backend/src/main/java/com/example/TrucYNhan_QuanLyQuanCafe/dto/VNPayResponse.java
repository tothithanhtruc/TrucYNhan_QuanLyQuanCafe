package com.example.TrucYNhan_QuanLyQuanCafe.dto;

public record VNPayResponse(
        boolean success,
        String message,
        String orderCode,
        String transactionId,
        String amount,
        String bankCode,
        String payDate,
        String responseCode
) {
}
