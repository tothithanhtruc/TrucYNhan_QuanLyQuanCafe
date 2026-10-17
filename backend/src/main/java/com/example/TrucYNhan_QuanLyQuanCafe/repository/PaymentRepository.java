
package com.example.TrucYNhan_QuanLyQuanCafe.repository;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Tìm các khoản thanh toán của một đơn hàng
    List<Payment> findByOrderId(Long orderId);

    // Tìm thanh toán theo trạng thái
    List<Payment> findByStatusIgnoreCase(String status);
}
