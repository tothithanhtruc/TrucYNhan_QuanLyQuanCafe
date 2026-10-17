package com.example.TrucYNhan_QuanLyQuanCafe.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record EmployeeResponse(
        Long id,
        Long userId,
        String username,
        String fullName,
        String gender,
        String phone,
        String address,
        BigDecimal salary,
        LocalDate hireDate,
        Integer status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
