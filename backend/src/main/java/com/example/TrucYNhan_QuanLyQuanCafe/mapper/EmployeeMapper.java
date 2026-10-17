package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.EmployeeRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.EmployeeResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Employee;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class EmployeeMapper {

    public Employee toEntity(EmployeeRequest request) {
        if (request == null) {
            return null;
        }

        Employee employee = new Employee();
        employee.setFullName(request.fullName());
        employee.setGender(request.gender());
        employee.setPhone(request.phone());
        employee.setAddress(request.address());
        employee.setSalary(request.salary() != null ? request.salary() : BigDecimal.ZERO);
        employee.setHireDate(request.hireDate());
        employee.setStatus(request.status() != null ? request.status() : 1);

        return employee;
    }

    public EmployeeResponse toResponse(Employee employee) {
        if (employee == null) {
            return null;
        }

        return new EmployeeResponse(
                employee.getId(),
                employee.getUser() != null ? employee.getUser().getId() : null,
                employee.getUser() != null ? employee.getUser().getUsername() : null,
                employee.getFullName(),
                employee.getGender(),
                employee.getPhone(),
                employee.getAddress(),
                employee.getSalary(),
                employee.getHireDate(),
                employee.getStatus(),
                employee.getCreatedAt(),
                employee.getUpdatedAt()
        );
    }
}
