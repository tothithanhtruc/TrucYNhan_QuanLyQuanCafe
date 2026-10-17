package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.time.LocalDateTime;

public record BannerResponse(
        Long id,
        String name,
        String image,
        String link,
        String position,
        Integer sortOrder,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Integer status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
