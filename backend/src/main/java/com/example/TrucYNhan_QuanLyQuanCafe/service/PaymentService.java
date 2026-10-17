
package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.PaymentRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {

    List<PaymentResponse> findAll();

    PaymentResponse findById(Long id);

    PaymentResponse create(PaymentRequest request);

    PaymentResponse update(Long id, PaymentRequest request);

    void delete(Long id);

    List<PaymentResponse> findByOrderId(Long orderId);

    List<PaymentResponse> findByStatus(String status);
}
