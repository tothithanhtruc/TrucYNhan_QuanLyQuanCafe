package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.PromotionRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.PromotionResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Promotion;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.PromotionMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.PromotionRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.PromotionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionMapper promotionMapper;

    public PromotionServiceImpl(PromotionRepository promotionRepository, PromotionMapper promotionMapper) {
        this.promotionRepository = promotionRepository;
        this.promotionMapper = promotionMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getAll() {
        return promotionRepository.findByDeletedAtIsNull().stream()
                .map(promotionMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse getById(Long id) {
        return promotionRepository.findById(id)
                .map(promotionMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khuyến mãi với id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse getByCode(String code) {
        return promotionRepository.findByCodeAndDeletedAtIsNull(code)
                .map(promotionMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khuyến mãi với mã: " + code));
    }

    @Override
    public PromotionResponse create(PromotionRequest request) {
        Promotion promotion = promotionMapper.toEntity(request);
        return promotionMapper.toResponse(promotionRepository.save(promotion));
    }

    @Override
    public PromotionResponse update(Long id, PromotionRequest request) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khuyến mãi với id: " + id));

        existing.setName(request.name());
        existing.setCode(request.code());
        existing.setDescription(request.description());
        existing.setDiscountType(request.discountType());
        if (request.discountValue() != null) existing.setDiscountValue(request.discountValue());
        existing.setStartDate(request.startDate());
        existing.setEndDate(request.endDate());
        if (request.minOrderAmount() != null) existing.setMinOrderAmount(request.minOrderAmount());
        if (request.quantity() != null) existing.setQuantity(request.quantity());
        if (request.status() != null) existing.setStatus(request.status());

        return promotionMapper.toResponse(promotionRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khuyến mãi với id: " + id));
        existing.setDeletedAt(LocalDateTime.now());
        promotionRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getDeleted() {
        return promotionRepository.findByDeletedAtIsNotNull().stream()
                .map(promotionMapper::toResponse).toList();
    }

    @Override
    public void restore(Long id) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khuyến mãi với id: " + id));
        existing.setDeletedAt(null);
        promotionRepository.save(existing);
    }

    @Override
    public void permanentlyDelete(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy khuyến mãi với id: " + id);
        }
        promotionRepository.deleteById(id);
    }
}
