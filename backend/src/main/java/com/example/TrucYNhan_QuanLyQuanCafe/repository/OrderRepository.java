package com.example.TrucYNhan_QuanLyQuanCafe.repository;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByDeletedAtIsNull();
    List<Order> findByDeletedAtIsNotNull();
    List<Order> findByStatusIgnoreCaseAndDeletedAtIsNull(String status);
    List<Order> findByUserIdAndDeletedAtIsNull(Long userId);
}
