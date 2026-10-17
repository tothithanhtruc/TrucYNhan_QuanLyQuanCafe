
package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record PaymentRequest(

    @NotNull(message = "Mã đơn hàng không được để trống")
    @Positive(message = "Mã đơn hàng phải lớn hơn 0")
    Long orderId,

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    String paymentMethod,

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    BigDecimal amount,

    String transactionCode,

    String status
) {
}
