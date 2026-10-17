package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PromotionRequest(
        @NotBlank(message = "Tên khuyến mãi không được để trống")
        @Size(max = 150)
        String name,

        @Size(max = 50)
        String code,

        @Size(max = 255)
        String description,

        @NotBlank(message = "Loại giảm giá không được để trống")
        @Size(max = 30)
        String discountType,   // PERCENT | AMOUNT

        @NotNull(message = "Giá trị giảm không được để trống")
        @PositiveOrZero(message = "Giá trị giảm không được âm")
        BigDecimal discountValue,

        LocalDateTime startDate,

        LocalDateTime endDate,

        @PositiveOrZero(message = "Giá trị đơn tối thiểu không được âm")
        BigDecimal minOrderAmount,

        @PositiveOrZero(message = "Số lượng không được âm")
        Integer quantity,

        Integer status
) {}
