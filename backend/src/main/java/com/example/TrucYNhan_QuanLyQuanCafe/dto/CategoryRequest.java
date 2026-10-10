
package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

        @NotBlank(message = "Tên danh mục không được để trống")
        @Size(max = 100, message = "Tên danh mục không được vượt quá 100 ký tự")
        String name,

        @Size(max = 150, message = "Alias không được vượt quá 150 ký tự")
        String alias,

        @Size(max = 255, message = "Đường dẫn hình ảnh không được vượt quá 255 ký tự")
        String image,

        @PositiveOrZero(message = "Danh mục cha phải lớn hơn hoặc bằng 0")
        Long parentId,

        @Size(max = 255, message = "Mô tả không được vượt quá 255 ký tự")
        String description,

        @PositiveOrZero(message = "Thứ tự hiển thị không được âm")
        Integer sortOrder,

        @PositiveOrZero(message = "Trạng thái không được âm")
        Integer status

) {
}