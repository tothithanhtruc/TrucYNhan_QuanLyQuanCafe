package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.OrderRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.OrderItemResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.OrderResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OrderMapper {

    public Order toEntity(OrderRequest request) {
        if (request == null) return null;

        Order order = new Order();
        order.setOrderCode(request.orderCode());
        order.setOrderType(request.orderType() != null ? request.orderType() : "ONLINE");
        order.setTotalAmount(request.totalAmount() != null ? request.totalAmount() : BigDecimal.ZERO);
        order.setShippingFee(request.shippingFee() != null ? request.shippingFee() : BigDecimal.ZERO);
        order.setDeliveryAddress(request.deliveryAddress());
        order.setStatus(request.status() != null ? request.status() : "CART");
        order.setNote(request.note());
        return order;
    }

    public OrderResponse toResponse(Order order) {
        if (order == null) return null;

        return new OrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getUser() != null ? order.getUser().getId() : null,
                order.getUser() != null ? order.getUser().getUsername() : null,
                order.getEmployee() != null ? order.getEmployee().getId() : null,
                order.getEmployee() != null ? order.getEmployee().getFullName() : null,
                order.getTable() != null ? order.getTable().getId() : null,
                order.getTable() != null ? order.getTable().getTableName() : null,
                order.getOrderType(),
                order.getOrderDate(),
                order.getTotalAmount(),
                order.getShippingFee(),
                order.getDeliveryAddress(),
                order.getStatus(),
                order.getNote(),
                order.getItems().stream()
                        .map(item -> new OrderItemResponse(
                                item.getProduct().getId(),
                                item.getProductName(),
                                item.getQuantity(),
                                item.getUnitPrice(),
                                item.getSubtotal()))
                        .toList(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getDeletedAt()
        );
    }
}
