package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.IngredientRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.IngredientResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Ingredient;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.IngredientMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.IngredientRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.IngredientService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;

@Service
@Transactional
public class IngredientServiceImpl implements IngredientService {

    private final IngredientRepository ingredientRepository;
    private final IngredientMapper ingredientMapper;

    public IngredientServiceImpl(IngredientRepository ingredientRepository, IngredientMapper ingredientMapper) {
        this.ingredientRepository = ingredientRepository;
        this.ingredientMapper = ingredientMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientResponse> getAll() {
        return ingredientRepository.findByDeletedAtIsNullOrderByCreatedAtDescIdDesc()
                .stream()
                .map(ingredientMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public IngredientResponse getById(Long id) {
        return ingredientRepository.findById(id)
                .map(ingredientMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nguyên liệu với id: " + id));
    }

    @Override
    public IngredientResponse create(IngredientRequest request) {
        Ingredient ingredient = ingredientMapper.toEntity(request);
        return ingredientMapper.toResponse(ingredientRepository.save(ingredient));
    }

    @Override
    public IngredientResponse update(Long id, IngredientRequest request) {
        Ingredient existing = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nguyên liệu với id: " + id));

        existing.setName(request.name());
        existing.setUnit(request.unit());
        if (request.quantity() != null) {
            existing.setQuantity(request.quantity());
        }
        if (request.minQuantity() != null) {
            existing.setMinQuantity(request.minQuantity());
        }
        existing.setDescription(request.description());
        if (request.status() != null) {
            existing.setStatus(request.status());
        }

        return ingredientMapper.toResponse(ingredientRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nguyên liệu với id: " + id));
        ingredient.setDeletedAt(LocalDateTime.now());
        ingredientRepository.save(ingredient);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredientResponse> getDeleted() {
        return ingredientRepository.findByDeletedAtIsNotNullOrderByDeletedAtDescIdDesc()
                .stream()
                .map(ingredientMapper::toResponse)
                .toList();
    }

    @Override
    public void restore(Long id) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .filter(item -> item.getDeletedAt() != null)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nguyên liệu trong thùng rác với id: " + id));
        ingredient.setDeletedAt(null);
        ingredientRepository.save(ingredient);
    }

    @Override
    public void permanentlyDelete(Long id) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .filter(item -> item.getDeletedAt() != null)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nguyên liệu trong thùng rác với id: " + id));
        ingredientRepository.delete(ingredient);
    }
}
