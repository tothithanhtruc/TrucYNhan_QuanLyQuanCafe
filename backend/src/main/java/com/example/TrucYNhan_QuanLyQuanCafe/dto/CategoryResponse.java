
package com.example.TrucYNhan_QuanLyQuanCafe.dto;

public record CategoryResponse(

        Long id,

        String name,

        String alias,

        String image,

        Long parentId,

        String description,

        Integer sortOrder,

        Integer status

) {
}