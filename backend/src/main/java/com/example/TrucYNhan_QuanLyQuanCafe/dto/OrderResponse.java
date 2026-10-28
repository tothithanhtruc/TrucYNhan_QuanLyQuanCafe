package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        String orderCode,
        Long userId,
        String username,
        Long employeeId,
        String employeeName,
        Long tableId,
        String tableName,
        String orderType,
        LocalDateTime orderDate,
        BigDecimal totalAmount,
        BigDecimal shippingFee,
        String deliveryAddress,
        String status,
        String note,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt
) {
}
