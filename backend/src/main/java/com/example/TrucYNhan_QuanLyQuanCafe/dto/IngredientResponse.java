package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record IngredientResponse(
        Long id,
        String name,
        String unit,
        BigDecimal quantity,
        BigDecimal minQuantity,
        String description,
        Integer status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
