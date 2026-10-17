package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.IngredientRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.IngredientResponse;

import java.util.List;

public interface IngredientService {

    List<IngredientResponse> getAll();

    IngredientResponse getById(Long id);

    IngredientResponse create(IngredientRequest request);

    IngredientResponse update(Long id, IngredientRequest request);

    void delete(Long id);
}
