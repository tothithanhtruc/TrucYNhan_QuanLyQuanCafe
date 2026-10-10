package com.example.TrucYNhan_QuanLyQuanCafe.service;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.ProductRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Product;

import java.util.List;

public interface ProductService {

    List<Product> getAllProducts();

    Product getProductById(Long id);

    Product create(ProductRequest request);

    Product update(Long id, Product product);

    void delete(Long id);

    List<Product> findByNameContaining(String name);

    List<Product> findProductsPriceGreaterThan30000();
}
