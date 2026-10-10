package com.example.TrucYNhan_QuanLyQuanCafe.repository;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Phương thức 1: Có sẵn từ JpaRepository
    // findAll()

    // Phương thức 2: Tìm sản phẩm theo tên
    List<Product> findByNameContaining(String name);

    // Phương thức 3: Tìm sản phẩm có giá lớn hơn 30000
    @Query("SELECT p FROM Product p WHERE p.price > 30000")
    List<Product> findProductsPriceGreaterThan30000();
}