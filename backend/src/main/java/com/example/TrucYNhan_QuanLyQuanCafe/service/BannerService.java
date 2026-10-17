package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.BannerRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.BannerResponse;

import java.util.List;

public interface BannerService {

    List<BannerResponse> getAll();

    BannerResponse getById(Long id);

    BannerResponse create(BannerRequest request);

    BannerResponse update(Long id, BannerRequest request);

    void delete(Long id);
}
