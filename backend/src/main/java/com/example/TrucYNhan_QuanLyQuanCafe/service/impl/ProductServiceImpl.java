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
        return productRepository.findAll();
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
    public Product update(Long id, Product product) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id));

        if (product.getName() != null) {
            existingProduct.setName(product.getName());
        }
        if (product.getAlias() != null) {
            existingProduct.setAlias(product.getAlias());
        }
        if (product.getCategory() != null) {
            if (product.getCategory().getId() != null && !categoryRepository.existsById(product.getCategory().getId())) {
                throw new BadRequestException("Danh mục không tồn tại với id: " + product.getCategory().getId());
            }
            existingProduct.setCategory(product.getCategory());
        }
        if (product.getSummary() != null) {
            existingProduct.setSummary(product.getSummary());
        }
        if (product.getDetail() != null) {
            existingProduct.setDetail(product.getDetail());
        }
        if (product.getPrice() != null) {
            existingProduct.setPrice(product.getPrice());
        }
        if (product.getSalePrice() != null) {
            existingProduct.setSalePrice(product.getSalePrice());
        }
        if (product.getQuantity() != null) {
            existingProduct.setQuantity(product.getQuantity());
        }
        if (product.getUnit() != null) {
            existingProduct.setUnit(product.getUnit());
        }
        if (product.getImage() != null) {
            existingProduct.setImage(product.getImage());
        }
        if (product.getTag() != null) {
            existingProduct.setTag(product.getTag());
        }
        if (product.getStatus() != null) {
            existingProduct.setStatus(product.getStatus());
        }

        return productRepository.save(existingProduct);
    }

    @Override
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id);
        }
        productRepository.deleteById(id);
    }

    @Override
    public List<Product> findByNameContaining(String name) {
        return productRepository.findByNameContaining(name);
    }

    @Override
    public List<Product> findProductsPriceGreaterThan30000() {
        return productRepository.findProductsPriceGreaterThan30000();
    }
}
