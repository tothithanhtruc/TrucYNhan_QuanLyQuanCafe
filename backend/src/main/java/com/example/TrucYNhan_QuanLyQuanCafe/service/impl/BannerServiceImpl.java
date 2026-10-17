package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.BannerRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.BannerResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Banner;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.BannerMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.BannerRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.BannerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;

    public BannerServiceImpl(BannerRepository bannerRepository, BannerMapper bannerMapper) {
        this.bannerRepository = bannerRepository;
        this.bannerMapper = bannerMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponse> getAll() {
        return bannerRepository.findAll()
                .stream()
                .map(bannerMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BannerResponse getById(Long id) {
        return bannerRepository.findById(id)
                .map(bannerMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner với id: " + id));
    }

    @Override
    public BannerResponse create(BannerRequest request) {
        Banner banner = bannerMapper.toEntity(request);
        return bannerMapper.toResponse(bannerRepository.save(banner));
    }

    @Override
    public BannerResponse update(Long id, BannerRequest request) {
        Banner existing = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner với id: " + id));

        existing.setName(request.name());
        existing.setImage(request.image());
        existing.setLink(request.link());
        existing.setPosition(request.position());
        if (request.sortOrder() != null) {
            existing.setSortOrder(request.sortOrder());
        }
        existing.setStartDate(request.startDate());
        existing.setEndDate(request.endDate());
        if (request.status() != null) {
            existing.setStatus(request.status());
        }

        return bannerMapper.toResponse(bannerRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy banner với id: " + id);
        }
        bannerRepository.deleteById(id);
    }
}
