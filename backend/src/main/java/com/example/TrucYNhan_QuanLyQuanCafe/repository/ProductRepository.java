package com.example.TrucYNhan_QuanLyQuanCafe.repository;

import com.example.TrucYNhan_QuanLyQuanCafe.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByDeletedAtIsNullOrderByCreatedAtDescIdDesc();
    List<Product> findByDeletedAtIsNotNull();

    // Phương thức 1: Có sẵn từ JpaRepository
    // findAll()

    // Phương thức 2: Tìm sản phẩm theo tên
    List<Product> findByNameContainingAndDeletedAtIsNull(String name);

    // Phương thức 3: Tìm sản phẩm có giá lớn hơn 30000
    @Query("SELECT p FROM Product p WHERE p.price > 30000 AND p.deletedAt IS NULL")
    List<Product> findProductsPriceGreaterThan30000();

     // 5. Tìm sản phẩm còn hàng
    List<Product> findByQuantityGreaterThan(Integer quantity);

    // 6. Tìm sản phẩm theo tên và danh mục
    @Query("""
        SELECT p FROM Product p
        WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))
        AND p.category.id = :categoryId
        AND p.deletedAt IS NULL
        """)
    List<Product> searchByNameAndCategory(
        @Param("name") String name,
        @Param("categoryId") Long categoryId
    );

}