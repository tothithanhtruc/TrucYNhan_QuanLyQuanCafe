package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String username,
        String fullName,
        String email,
        String phone,
        String address,
        String gender,
        String image,
        String role,
        Integer status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
