package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        String title,
        String alias,
        String summary,
        String content,
        String thumbnail,
        Long topicId,
        String topicName,
        Long userId,
        String username,
        Integer status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt
) {}
