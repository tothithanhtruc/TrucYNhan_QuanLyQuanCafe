
package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Employee;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.EmployeeRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // 1. Lấy danh sách nhân viên
    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // 2. Lấy nhân viên theo ID
    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy nhân viên có ID: " + id));
    }

    // 3. Tìm nhân viên theo tên
    @Transactional(readOnly = true)
    public List<Employee> searchEmployees(String name) {
        if (name == null || name.trim().isEmpty()) {
            return employeeRepository.findAll();
        }

        return employeeRepository
                .findByFullNameContainingIgnoreCase(name.trim());
    }

    // 4. Thêm nhân viên
    public Employee createEmployee(Employee employee) {
        if (employee.getFullName() == null
                || employee.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Họ tên nhân viên không được để trống");
        }

        employee.setId(null);

        return employeeRepository.save(employee);
    }

    // 5. Cập nhật nhân viên
    public Employee updateEmployee(Long id, Employee request) {
        Employee employee = getEmployeeById(id);

        if (request.getFullName() == null
                || request.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Họ tên nhân viên không được để trống");
        }

        employee.setFullName(request.getFullName().trim());
        employee.setGender(request.getGender());
        employee.setPhone(request.getPhone());
        employee.setAddress(request.getAddress());
        employee.setSalary(request.getSalary());
        employee.setHireDate(request.getHireDate());
        employee.setStatus(request.getStatus());

        return employeeRepository.save(employee);
    }

    // 6. Xóa nhân viên
    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employeeRepository.delete(employee);
    }
}
