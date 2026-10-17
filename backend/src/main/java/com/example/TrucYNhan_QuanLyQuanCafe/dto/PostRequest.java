package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostRequest(
        @NotBlank(message = "Tiêu đề bài viết không được để trống")
        @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
        String title,

        @Size(max = 255)
        String alias,

        @Size(max = 500, message = "Mô tả ngắn không được vượt quá 500 ký tự")
        String summary,

        String content,

        @Size(max = 255)
        String thumbnail,

        Long topicId,

        Long userId,

        Integer status
) {}
