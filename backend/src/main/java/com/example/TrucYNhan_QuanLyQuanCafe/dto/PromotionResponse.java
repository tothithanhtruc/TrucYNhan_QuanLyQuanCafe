package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PromotionResponse(
        Long id,
        String name,
        String code,
        String description,
        String discountType,
        BigDecimal discountValue,
        LocalDateTime startDate,
        LocalDateTime endDate,
        BigDecimal minOrderAmount,
        Integer quantity,
        Integer status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
