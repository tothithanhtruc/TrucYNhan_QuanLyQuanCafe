package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.exception.BadRequestException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DrinkCustomizationTests {
    @Test
    void calculatesToppingPricesFromBackendCatalog() {
        assertEquals(
                BigDecimal.valueOf(37000),
                DrinkCustomization.getToppingAmount(List.of("PEARL", "COFFEE_JELLY", "CHEESE_CREAM"))
        );
    }

    @Test
    void rejectsUnknownToppingInsteadOfAcceptingClientPrice() {
        assertThrows(
                BadRequestException.class,
                () -> DrinkCustomization.normalizeToppings(List.of("FREE_TOPPING"))
        );
    }

    @Test
    void defaultsExistingCheckoutClientsToRegularSugarAndIce() {
        assertEquals("100%", DrinkCustomization.normalizeSugarLevel(null));
        assertEquals("NORMAL", DrinkCustomization.normalizeIceLevel(null));
    }
}
