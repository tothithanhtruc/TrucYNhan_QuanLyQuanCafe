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

        @Size(max = 100, message = "Tên khách hàng không được vượt quá 100 ký tự")
        String customerName,

        @Size(max = 30, message = "Số điện thoại không được vượt quá 30 ký tự")
        String customerPhone,

        @Size(max = 255, message = "Ghi chú không được vượt quá 255 ký tự")
        String note,

        @NotEmpty(message = "Giỏ hàng chưa có sản phẩm")
        @Size(max = 100, message = "Giỏ hàng không được vượt quá 100 sản phẩm")
        List<@Valid CheckoutItemRequest> items
) {
}
