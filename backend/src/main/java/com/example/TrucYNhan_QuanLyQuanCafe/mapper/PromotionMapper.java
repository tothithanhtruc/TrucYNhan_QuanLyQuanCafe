package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.PromotionRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.PromotionResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Promotion;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PromotionMapper {

    public Promotion toEntity(PromotionRequest request) {
        if (request == null) return null;

        Promotion promotion = new Promotion();
        promotion.setName(request.name());
        promotion.setCode(request.code());
        promotion.setDescription(request.description());
        promotion.setDiscountType(request.discountType());
        promotion.setDiscountValue(request.discountValue() != null ? request.discountValue() : BigDecimal.ZERO);
        promotion.setStartDate(request.startDate());
        promotion.setEndDate(request.endDate());
        promotion.setMinOrderAmount(request.minOrderAmount() != null ? request.minOrderAmount() : BigDecimal.ZERO);
        promotion.setQuantity(request.quantity() != null ? request.quantity() : 0);
        promotion.setStatus(request.status() != null ? request.status() : 1);
        return promotion;
    }

    public PromotionResponse toResponse(Promotion promotion) {
        if (promotion == null) return null;

        return new PromotionResponse(
                promotion.getId(),
                promotion.getName(),
                promotion.getCode(),
                promotion.getDescription(),
                promotion.getDiscountType(),
                promotion.getDiscountValue(),
                promotion.getStartDate(),
                promotion.getEndDate(),
                promotion.getMinOrderAmount(),
                promotion.getQuantity(),
                promotion.getStatus(),
                promotion.getCreatedAt(),
                promotion.getUpdatedAt()
        );
    }
}
