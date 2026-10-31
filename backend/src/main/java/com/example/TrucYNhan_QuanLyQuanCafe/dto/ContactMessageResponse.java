package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.time.LocalDateTime;

public record ContactMessageResponse(
        Long id,
        String senderRole,
        String message,
        LocalDateTime createdAt
) {
}
