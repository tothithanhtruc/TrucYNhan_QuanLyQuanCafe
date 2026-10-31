package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.VNPayResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface VNPayService {
    String createPaymentUrl(String orderCode, String bankCode, HttpServletRequest request);
    VNPayResponse verifyPayment(Map<String, String> params);
    Map<String, Object> simulatePaymentSuccess(String orderCode, String bankCode, String cardNumber, String cardHolder);
}
