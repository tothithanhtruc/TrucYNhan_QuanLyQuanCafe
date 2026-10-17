package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.TopicRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.TopicResponse;

import java.util.List;

public interface TopicService {
    List<TopicResponse> getAll();
    TopicResponse getById(Long id);
    TopicResponse create(TopicRequest request);
    TopicResponse update(Long id, TopicRequest request);
    void delete(Long id);
}
