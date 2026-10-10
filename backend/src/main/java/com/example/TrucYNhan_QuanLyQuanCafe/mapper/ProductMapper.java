package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.ProductRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.ProductResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Category;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequest request) {
        if (request == null) {
            return null;
        }

        Product product = new Product();
        product.setName(request.name());
        product.setSummary(request.summary());
        product.setDetail(request.detail());
        product.setPrice(request.price());
        product.setSalePrice(request.salePrice());
        product.setQuantity(request.quantity() != null ? request.quantity() : 0);
        product.setUnit(request.unit() != null ? request.unit() : "ly");
        product.setImage(request.image());
        product.setTag(request.tag());
        product.setStatus(request.status() != null ? request.status() : 1);

        if (request.categoryId() != null) {
            Category category = new Category();
            category.setId(request.categoryId());
            product.setCategory(category);
        }

        return product;
    }

    public ProductResponse toResponse(Product product) {
        if (product == null) {
            return null;
        }

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getCategory() == null ? null : product.getCategory().getId(),
                product.getSummary(),
                product.getDetail(),
                product.getPrice(),
                product.getSalePrice(),
                product.getQuantity(),
                product.getUnit(),
                product.getImage(),
                product.getTag(),
                product.getStatus()
        );
    }
}
