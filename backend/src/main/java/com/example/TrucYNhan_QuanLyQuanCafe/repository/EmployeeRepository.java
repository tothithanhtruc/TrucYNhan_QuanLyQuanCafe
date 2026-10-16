
package com.example.TrucYNhan_QuanLyQuanCafe.repository;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Tìm nhân viên theo họ tên
    List<Employee> findByFullNameContainingIgnoreCase(String fullName);

    // Kiểm tra nhân viên đã liên kết với tài khoản User chưa
    boolean existsByUser_Id(Long userId);
}
