
package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductRequest(

        @NotBlank(message = "Tên sản phẩm không được để trống")
        @Size(max = 150, message = "Tên sản phẩm không được vượt quá 150 ký tự")
        String name,

        @NotNull(message = "Danh mục không được để trống")
        @Positive(message = "Danh mục phải lớn hơn 0")
        Long categoryId,

        @Size(max = 500, message = "Mô tả ngắn không được vượt quá 500 ký tự")
        String summary,

        String detail,

        @NotNull(message = "Giá sản phẩm không được để trống")
        @Positive(message = "Giá sản phẩm phải lớn hơn 0")
        BigDecimal price,

        @PositiveOrZero(message = "Giá khuyến mãi không được âm")
        BigDecimal salePrice,

        @PositiveOrZero(message = "Số lượng không được âm")
        Integer quantity,

        @Size(max = 30, message = "Đơn vị không được vượt quá 30 ký tự")
        String unit,

        @Size(max = 255, message = "Đường dẫn hình ảnh không được vượt quá 255 ký tự")
        String image,

        @Size(max = 50, message = "Nhãn sản phẩm không được vượt quá 50 ký tự")
        String tag,

        @PositiveOrZero(message = "Trạng thái không được âm")
        Integer status

) {
}