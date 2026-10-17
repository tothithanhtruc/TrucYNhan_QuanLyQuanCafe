package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record IngredientRequest(
        @NotBlank(message = "Tên nguyên liệu không được để trống")
        @Size(max = 100, message = "Tên nguyên liệu không được vượt quá 100 ký tự")
        String name,

        @NotBlank(message = "Đơn vị tính không được để trống")
        @Size(max = 30, message = "Đơn vị tính không được vượt quá 30 ký tự")
        String unit,

        @NotNull(message = "Số lượng không được để trống")
        @PositiveOrZero(message = "Số lượng không được âm")
        BigDecimal quantity,

        @PositiveOrZero(message = "Số lượng tối thiểu không được âm")
        BigDecimal minQuantity,

        @Size(max = 255, message = "Mô tả không được vượt quá 255 ký tự")
        String description,

        Integer status
) {
}
