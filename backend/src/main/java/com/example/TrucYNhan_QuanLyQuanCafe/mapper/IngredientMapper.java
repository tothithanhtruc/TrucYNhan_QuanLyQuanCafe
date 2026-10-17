package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.IngredientRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.IngredientResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Ingredient;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class IngredientMapper {

    public Ingredient toEntity(IngredientRequest request) {
        if (request == null) {
            return null;
        }

        Ingredient ingredient = new Ingredient();
        ingredient.setName(request.name());
        ingredient.setUnit(request.unit());
        ingredient.setQuantity(request.quantity() != null ? request.quantity() : BigDecimal.ZERO);
        ingredient.setMinQuantity(request.minQuantity() != null ? request.minQuantity() : BigDecimal.ZERO);
        ingredient.setDescription(request.description());
        ingredient.setStatus(request.status() != null ? request.status() : 1);

        return ingredient;
    }

    public IngredientResponse toResponse(Ingredient ingredient) {
        if (ingredient == null) {
            return null;
        }

        return new IngredientResponse(
                ingredient.getId(),
                ingredient.getName(),
                ingredient.getUnit(),
                ingredient.getQuantity(),
                ingredient.getMinQuantity(),
                ingredient.getDescription(),
                ingredient.getStatus(),
                ingredient.getCreatedAt(),
                ingredient.getUpdatedAt()
        );
    }
}
