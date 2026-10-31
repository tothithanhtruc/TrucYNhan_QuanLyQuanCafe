package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.NotBlank;

public record VNPayCreatePaymentRequest(
        @NotBlank(message = "Mã đơn hàng không được để trống")
        String orderCode,
        String bankCode
) {
}
