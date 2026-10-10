
package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.math.BigDecimal;

public record ProductResponse(

        Long id,

        String name,

        Long categoryId,

        String summary,

        String detail,

        BigDecimal price,

        BigDecimal salePrice,

        Integer quantity,

        String unit,

        String image,

        String tag,

        Integer status

) {
}