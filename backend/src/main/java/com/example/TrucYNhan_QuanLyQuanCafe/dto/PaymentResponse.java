
package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
    Long id,
    Long orderId,
    String paymentMethod,
    BigDecimal amount,
    LocalDateTime paymentDate,
    String transactionCode,
    String status,
    LocalDateTime createdAt
) {
}
