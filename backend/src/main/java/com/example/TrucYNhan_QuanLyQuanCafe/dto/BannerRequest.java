package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record BannerRequest(
        @NotBlank(message = "Tên banner không được để trống")
        @Size(max = 150, message = "Tên banner không được vượt quá 150 ký tự")
        String name,

        @NotBlank(message = "Hình ảnh banner không được để trống")
        @Size(max = 255, message = "Đường dẫn hình ảnh không được vượt quá 255 ký tự")
        String image,

        String link,
        String position,
        Integer sortOrder,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Integer status
) {
}
