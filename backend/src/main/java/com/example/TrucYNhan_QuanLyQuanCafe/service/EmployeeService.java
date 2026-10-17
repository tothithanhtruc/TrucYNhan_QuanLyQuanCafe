package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.EmployeeRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.EmployeeResponse;

import java.util.List;

public interface EmployeeService {

    List<EmployeeResponse> getAll();

    EmployeeResponse getById(Long id);

    EmployeeResponse create(EmployeeRequest request);

    EmployeeResponse update(Long id, EmployeeRequest request);

    void delete(Long id);
}
