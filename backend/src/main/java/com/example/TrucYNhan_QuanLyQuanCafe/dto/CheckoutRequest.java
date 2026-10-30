package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CheckoutRequest(
        @NotBlank(message = "Vui lòng nhập địa chỉ giao hàng")
        @Size(max = 255, message = "Địa chỉ giao hàng không được vượt quá 255 ký tự")
        String deliveryAddress,

        @Size(max = 255, message = "Ghi chú không được vượt quá 255 ký tự")
        String note,

        @NotEmpty(message = "Giỏ hàng chưa có sản phẩm")
        @Size(max = 100, message = "Giỏ hàng không được vượt quá 100 sản phẩm")
        List<@Valid CheckoutItemRequest> items
) {
}
