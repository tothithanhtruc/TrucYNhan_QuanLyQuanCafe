package com.example.TrucYNhan_QuanLyQuanCafe.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "sugar_level", length = 10)
    private String sugarLevel;

    @Column(name = "ice_level", length = 20)
    private String iceLevel;

    @Column(name = "toppings", columnDefinition = "TEXT")
    private String toppings;

    @Column(name = "topping_amount", precision = 12, scale = 2)
    private BigDecimal toppingAmount = BigDecimal.ZERO;

    public Long getId() {
        return id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public String getSugarLevel() {
        return sugarLevel;
    }

    public void setSugarLevel(String sugarLevel) {
        this.sugarLevel = sugarLevel;
    }

    public String getIceLevel() {
        return iceLevel;
    }

    public void setIceLevel(String iceLevel) {
        this.iceLevel = iceLevel;
    }

    public List<String> getToppings() {
        if (toppings == null || toppings.isBlank()) {
            return List.of();
        }
        return Arrays.stream(toppings.split(","))
                .filter(value -> !value.isBlank())
                .toList();
    }

    public void setToppings(List<String> toppings) {
        this.toppings = toppings == null ? "" : String.join(",", toppings);
    }

    public BigDecimal getToppingAmount() {
        return toppingAmount == null ? BigDecimal.ZERO : toppingAmount;
    }

    public void setToppingAmount(BigDecimal toppingAmount) {
        this.toppingAmount = toppingAmount;
    }
}
