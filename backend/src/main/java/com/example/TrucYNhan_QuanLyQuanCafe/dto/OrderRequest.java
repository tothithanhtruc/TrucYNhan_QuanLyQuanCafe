package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record OrderRequest(
        @NotBlank(message = "Mã đơn hàng không được để trống")
        @Size(max = 50, message = "Mã đơn hàng không được vượt quá 50 ký tự")
        String orderCode,

        Long userId,

        Long employeeId,

        Long tableId,

        String orderType,

        @PositiveOrZero(message = "Tổng tiền không được âm")
        BigDecimal totalAmount,

        @PositiveOrZero(message = "Phí giao hàng không được âm")
        BigDecimal shippingFee,

        String deliveryAddress,

        String status,

        String note
) {
}
