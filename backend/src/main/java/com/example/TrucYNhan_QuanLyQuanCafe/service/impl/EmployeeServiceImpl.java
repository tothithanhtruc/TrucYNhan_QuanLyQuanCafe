
package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.EmployeeRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.EmployeeResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Employee;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.User;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.EmployeeMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.EmployeeRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.UserRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.EmployeeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeMapper employeeMapper;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               UserRepository userRepository,
                               EmployeeMapper employeeMapper) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.employeeMapper = employeeMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAll() {
        return employeeRepository.findAll()
                .stream()
                .map(employeeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        return employeeRepository.findById(id)
                .map(employeeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với id: " + id));
    }

    @Override
    public EmployeeResponse create(EmployeeRequest request) {
        Employee employee = employeeMapper.toEntity(request);
        if (request.userId() != null) {
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản người dùng với id: " + request.userId()));
            employee.setUser(user);
        }
        return employeeMapper.toResponse(employeeRepository.save(employee));
    }

    @Override
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với id: " + id));

        existing.setFullName(request.fullName());
        existing.setGender(request.gender());
        existing.setPhone(request.phone());
        existing.setAddress(request.address());
        if (request.salary() != null) {
            existing.setSalary(request.salary());
        }
        existing.setHireDate(request.hireDate());
        if (request.status() != null) {
            existing.setStatus(request.status());
        }

        if (request.userId() != null) {
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản người dùng với id: " + request.userId()));
            existing.setUser(user);
        } else {
            existing.setUser(null);
        }

        return employeeMapper.toResponse(employeeRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy nhân viên với id: " + id);
        }
        employeeRepository.deleteById(id);
    }
}
