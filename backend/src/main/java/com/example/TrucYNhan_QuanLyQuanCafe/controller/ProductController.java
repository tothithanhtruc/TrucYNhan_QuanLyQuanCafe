
package com.example.TrucYNhan_QuanLyQuanCafe.controller;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.ProductRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Product;
import com.example.TrucYNhan_QuanLyQuanCafe.service.ProductService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // GET tất cả sản phẩm
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts() {
        List<Product> products = productService.getAllProducts();

        return ResponseEntity.ok(Map.of(
                "message", "Lấy danh sách sản phẩm thành công",
                "data", products
        ));
    }

    // GET sản phẩm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProductById(
            @PathVariable Long id) {

        Product product = productService.getProductById(id);

        return ResponseEntity.ok(Map.of(
                "message", "Lấy thông tin sản phẩm thành công",
                "data", product
        ));
    }

    // POST thêm sản phẩm
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @Valid @RequestBody ProductRequest request) {

        Product result = productService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Thêm sản phẩm thành công",
                "data", result
        ));
    }

    // PUT cập nhật sản phẩm
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @RequestBody Product product) {

        Product result = productService.update(id, product);

        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật sản phẩm thành công",
                "data", result
        ));
    }

    // DELETE xóa sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(
            @PathVariable Long id) {

        productService.delete(id);

        return ResponseEntity.ok(Map.of(
                "message", "Xóa sản phẩm thành công"
        ));
    }

    // Tìm sản phẩm theo tên
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchByName(
            @RequestParam String name) {

        List<Product> products =
                productService.findByNameContaining(name);

        return ResponseEntity.ok(Map.of(
                "message", "Tìm kiếm sản phẩm thành công",
                "data", products
        ));
    }

    // Tìm sản phẩm có giá lớn hơn 30000
    @GetMapping("/price")
    public ResponseEntity<Map<String, Object>>
            getProductsPriceGreaterThan30000() {

        List<Product> products =
                productService.findProductsPriceGreaterThan30000();

        return ResponseEntity.ok(Map.of(
                "message", "Lấy sản phẩm có giá trên 30000 thành công",
                "data", products
        ));
    }
}
