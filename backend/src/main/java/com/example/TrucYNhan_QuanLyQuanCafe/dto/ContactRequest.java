package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank(message = "Tên liên hệ không được để trống")
        @Size(max = 100, message = "Tên liên hệ không được vượt quá 100 ký tự")
        String name,

        @Email(message = "Email không hợp lệ")
        @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
        String email,

        @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
        String phone,

        @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
        String subject,

        @NotBlank(message = "Nội dung liên hệ không được để trống")
        String message,

        Integer status
) {
}
