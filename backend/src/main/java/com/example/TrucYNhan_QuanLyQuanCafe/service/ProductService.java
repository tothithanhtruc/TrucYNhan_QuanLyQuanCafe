package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.ProductRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Product;

import java.util.List;

public interface ProductService {

    // existing methods ...
    // Update now uses ProductRequest for validation and mapping
    com.example.TrucYNhan_QuanLyQuanCafe.dto.ProductRequest update(Long id, com.example.TrucYNhan_QuanLyQuanCafe.dto.ProductRequest request);


    // existing methods ...
    // Update method now accepts ProductRequest for consistency
    Product update(Long id, com.example.TrucYNhan_QuanLyQuanCafe.dto.ProductRequest request);

    List<Product> getAllProducts();

    Product getProductById(Long id);

    Product create(ProductRequest request);

    Product update(Long id, Product product);

    void delete(Long id);
    List<Product> getDeletedProducts();
    void restore(Long id);
    void permanentlyDelete(Long id);

    List<Product> findByNameContaining(String name);

    List<Product> findProductsPriceGreaterThan30000();
}
