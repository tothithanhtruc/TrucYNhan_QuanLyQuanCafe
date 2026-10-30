package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Max;

public record CheckoutItemRequest(
        @NotNull(message = "Sản phẩm không hợp lệ")
        @Positive(message = "Mã sản phẩm không hợp lệ")
        Long productId,

        @NotNull(message = "Vui lòng nhập số lượng")
        @Positive(message = "Số lượng phải lớn hơn 0")
        @Max(value = 1000, message = "Số lượng mỗi sản phẩm không được vượt quá 1000")
        Integer quantity
) {
}
