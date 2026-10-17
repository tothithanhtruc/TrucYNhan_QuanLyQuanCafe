package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.TableRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.TableResponse;

import java.util.List;

public interface TableService {
    List<TableResponse> getAll();
    TableResponse getById(Long id);
    TableResponse create(TableRequest request);
    TableResponse update(Long id, TableRequest request);
    void delete(Long id);
}
