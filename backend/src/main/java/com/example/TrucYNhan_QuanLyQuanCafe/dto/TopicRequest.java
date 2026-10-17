package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TopicRequest(
        @NotBlank(message = "Tên chủ đề không được để trống")
        @Size(max = 100, message = "Tên chủ đề không được vượt quá 100 ký tự")
        String name,

        @Size(max = 150)
        String alias,

        @Size(max = 255)
        String description,

        Integer sortOrder,

        Integer status
) {}
