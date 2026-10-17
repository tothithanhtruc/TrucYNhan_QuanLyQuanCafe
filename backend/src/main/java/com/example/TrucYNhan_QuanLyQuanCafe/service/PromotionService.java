package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.PromotionRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.PromotionResponse;

import java.util.List;

public interface PromotionService {
    List<PromotionResponse> getAll();
    PromotionResponse getById(Long id);
    PromotionResponse getByCode(String code);
    PromotionResponse create(PromotionRequest request);
    PromotionResponse update(Long id, PromotionRequest request);
    void delete(Long id);
}
