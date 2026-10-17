package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.time.LocalDateTime;

public record TopicResponse(
        Long id,
        String name,
        String alias,
        String description,
        Integer sortOrder,
        Integer status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
