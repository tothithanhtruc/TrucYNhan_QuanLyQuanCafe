package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.PostRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.PostResponse;

import java.util.List;

public interface PostService {
    List<PostResponse> getAll();
    PostResponse getById(Long id);
    PostResponse create(PostRequest request);
    PostResponse update(Long id, PostRequest request);
    void delete(Long id);
    void softDelete(Long id);
    void restore(Long id);
    List<PostResponse> getDeleted();
    void permanentlyDelete(Long id);
}
