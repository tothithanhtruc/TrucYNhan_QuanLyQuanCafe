package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.NotBlank;

public record ContactReplyRequest(
        @NotBlank(message = "Nội dung phản hồi không được để trống")
        String reply
) {
}
