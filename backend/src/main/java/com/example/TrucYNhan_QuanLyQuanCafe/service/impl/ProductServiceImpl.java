package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.ProductRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Product;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.BadRequestException;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.CategoryRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.ProductMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.ProductRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.ProductService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDateTime;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productMapper = productMapper;
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findByDeletedAtIsNullOrderByCreatedAtDescIdDesc();
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id));
    }

    @Override
    public Product create(ProductRequest request) {
        if (request.categoryId() == null || !categoryRepository.existsById(request.categoryId())) {
            throw new BadRequestException("Danh mục không tồn tại với id: " + request.categoryId());
        }

        Product product = productMapper.toEntity(request);
        return productRepository.save(product);
    }

    @Override
    public Product update(Long id, ProductRequest request) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id));

        if (!categoryRepository.existsById(request.categoryId())) {
            throw new BadRequestException("Danh mục không tồn tại với id: " + request.categoryId());
        }

        Product updated = productMapper.toEntity(request);
        existingProduct.setName(updated.getName());
        existingProduct.setCategory(updated.getCategory());
        existingProduct.setSummary(updated.getSummary());
        existingProduct.setDetail(updated.getDetail());
        existingProduct.setPrice(updated.getPrice());
        existingProduct.setSalePrice(updated.getSalePrice());
        existingProduct.setQuantity(updated.getQuantity());
        existingProduct.setUnit(updated.getUnit());
        existingProduct.setImage(updated.getImage());
        existingProduct.setTag(updated.getTag());
        existingProduct.setStatus(updated.getStatus());

        return productRepository.save(existingProduct);
    }

    @Override
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id);
        }
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id));
        product.setDeletedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    @Override
    public List<Product> getDeletedProducts() {
        return productRepository.findByDeletedAtIsNotNull();
    }

    @Override
    public void restore(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id));
        product.setDeletedAt(null);
        productRepository.save(product);
    }

    @Override
    public void permanentlyDelete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id);
        }
        productRepository.deleteById(id);
    }

    @Override
    public List<Product> findByNameContaining(String name) {
        return productRepository.findByNameContainingAndDeletedAtIsNull(name);
    }

    @Override
    public List<Product> findProductsPriceGreaterThan30000() {
        return productRepository.findProductsPriceGreaterThan30000();
    }
}
