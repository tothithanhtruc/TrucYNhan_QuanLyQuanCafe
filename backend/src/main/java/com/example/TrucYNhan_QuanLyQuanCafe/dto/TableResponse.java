package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.time.LocalDateTime;

public record TableResponse(
        Long id,
        String tableName,
        Integer capacity,
        String area,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
