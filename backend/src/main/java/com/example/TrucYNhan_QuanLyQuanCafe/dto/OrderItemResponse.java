package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.math.BigDecimal;
import java.util.List;

public record OrderItemResponse(
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal,
        String sugarLevel,
        String iceLevel,
        List<String> toppings,
        BigDecimal toppingAmount
) {
}
