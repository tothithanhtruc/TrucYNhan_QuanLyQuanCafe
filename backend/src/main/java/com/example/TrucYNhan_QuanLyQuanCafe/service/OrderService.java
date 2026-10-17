package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.OrderRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.OrderResponse;

import java.util.List;

public interface OrderService {
    List<OrderResponse> getAll();
    OrderResponse getById(Long id);
    OrderResponse create(OrderRequest request);
    OrderResponse update(Long id, OrderRequest request);
    void delete(Long id);
    List<OrderResponse> getByStatus(String status);
    List<OrderResponse> getByUserId(Long userId);
}
