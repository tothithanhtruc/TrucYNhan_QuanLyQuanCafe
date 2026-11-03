package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.CheckoutItemRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.CheckoutRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.OrderResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Order;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Product;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.User;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.OrderMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.EmployeeRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.OrderRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.ProductRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.PromotionRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.TableRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.UserRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OrderCheckoutCustomizationTests {
    @Test
    void checkoutUsesBackendToppingPricesAndPersistsCustomization() {
        OrderRepository orderRepository = mock(OrderRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        ProductRepository productRepository = mock(ProductRepository.class);
        PromotionRepository promotionRepository = mock(PromotionRepository.class);
        User user = new User();
        user.setUsername("customer");
        user.setFullName("Customer");
        when(userRepository.findByUsername("customer")).thenReturn(Optional.of(user));

        Product product = new Product();
        product.setId(42L);
        product.setName("Milk Tea");
        product.setPrice(BigDecimal.valueOf(50000));
        product.setStatus(1);
        product.setQuantity(5);
        when(productRepository.findById(42L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderServiceImpl service = new OrderServiceImpl(
                orderRepository,
                userRepository,
                productRepository,
                promotionRepository,
                mock(EmployeeRepository.class),
                mock(TableRepository.class),
                new OrderMapper());

        CheckoutRequest request = new CheckoutRequest(
                "123 Coffee Street",
                "Customer",
                "0900000000",
                null,
                List.of(new CheckoutItemRequest(
                        42L,
                        2,
                        "50%",
                        "LESS",
                        List.of("PEARL", "CHEESE_CREAM"))),
                null);

        OrderResponse response = service.checkout("customer", request);

        assertEquals(BigDecimal.valueOf(160000), response.totalAmount());
        assertEquals(1, response.items().size());
        assertEquals(2, response.items().get(0).quantity());
        assertEquals(BigDecimal.valueOf(80000), response.items().get(0).unitPrice());
        assertEquals(BigDecimal.valueOf(30000), response.items().get(0).toppingAmount());
        assertEquals("50%", response.items().get(0).sugarLevel());
        assertEquals("LESS", response.items().get(0).iceLevel());
        assertEquals(List.of("PEARL", "CHEESE_CREAM"), response.items().get(0).toppings());
        assertEquals(3, product.getQuantity());
    }
}
