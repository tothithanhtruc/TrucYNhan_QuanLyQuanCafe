package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.exception.BadRequestException;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class DrinkCustomization {
    public static final String DEFAULT_SUGAR_LEVEL = "100%";
    public static final String DEFAULT_ICE_LEVEL = "NORMAL";

    private static final Set<String> SUGAR_LEVELS = Set.of("0%", "50%", "100%");
    private static final Set<String> ICE_LEVELS = Set.of("NONE", "LESS", "NORMAL");
    private static final List<String> TOPPING_ORDER = List.of("PEARL", "COFFEE_JELLY", "CHEESE_CREAM");
    private static final Map<String, BigDecimal> TOPPING_PRICES = Map.of(
            "PEARL", BigDecimal.valueOf(20000),
            "COFFEE_JELLY", BigDecimal.valueOf(7000),
            "CHEESE_CREAM", BigDecimal.valueOf(10000));

    private DrinkCustomization() {
    }

    public static String normalizeSugarLevel(String value) {
        String normalized = value == null || value.isBlank()
                ? DEFAULT_SUGAR_LEVEL
                : value.trim();
        if (!SUGAR_LEVELS.contains(normalized)) {
            throw new BadRequestException("Mức đường không hợp lệ");
        }
        return normalized;
    }

    public static String normalizeIceLevel(String value) {
        String normalized = value == null || value.isBlank()
                ? DEFAULT_ICE_LEVEL
                : value.trim().toUpperCase();
        if (!ICE_LEVELS.contains(normalized)) {
            throw new BadRequestException("Mức đá không hợp lệ");
        }
        return normalized;
    }

    public static List<String> normalizeToppings(List<String> values) {
        if (values == null || values.isEmpty()) {
            return List.of();
        }

        Set<String> unique = new LinkedHashSet<>();
        for (String value : values) {
            if (value == null || !TOPPING_PRICES.containsKey(value)) {
                throw new BadRequestException("Topping không hợp lệ");
            }
            if (!unique.add(value)) {
                throw new BadRequestException("Không thể chọn trùng topping");
            }
        }
        return TOPPING_ORDER.stream()
                .filter(unique::contains)
                .toList();
    }

    public static BigDecimal getToppingAmount(List<String> toppings) {
        return toppings.stream()
                .map(TOPPING_PRICES::get)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}