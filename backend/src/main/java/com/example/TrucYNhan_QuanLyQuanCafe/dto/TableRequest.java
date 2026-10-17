package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TableRequest(
        @NotBlank(message = "Tên bàn không được để trống")
        @Size(max = 50, message = "Tên bàn không được vượt quá 50 ký tự")
        String tableName,

        Integer capacity,

        @Size(max = 100, message = "Khu vực không được vượt quá 100 ký tự")
        String area,

        String status
) {}
