package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.time.LocalDateTime;

public record ContactResponse(
        Long id,
        String name,
        String email,
        String phone,
        String subject,
        String message,
        Integer status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
