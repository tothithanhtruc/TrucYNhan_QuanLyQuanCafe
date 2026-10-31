package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.OrderRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.OrderResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.CheckoutItemRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.CheckoutRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Order;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.OrderItem;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Product;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.User;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Employee;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.TableEntity;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.BadRequestException;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.OrderMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.OrderRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.ProductRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.UserRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.EmployeeRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.TableRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.UUID;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmployeeRepository employeeRepository;
    private final TableRepository tableRepository;
    private final OrderMapper orderMapper;

    public OrderServiceImpl(OrderRepository orderRepository,
                            UserRepository userRepository,
                            ProductRepository productRepository,
                            EmployeeRepository employeeRepository,
                            TableRepository tableRepository,
                            OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.employeeRepository = employeeRepository;
        this.tableRepository = tableRepository;
        this.orderMapper = orderMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAll() {
        return orderRepository.findByDeletedAtIsNull().stream()
                .map(orderMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        return orderRepository.findById(id)
                .map(orderMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id: " + id));
    }

    @Override
    public OrderResponse create(OrderRequest request) {
        Order order = orderMapper.toEntity(request);
        setRelations(order, request);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse checkout(String username, CheckoutRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng đăng nhập"));

        Map<Long, Integer> requestedQuantities = new LinkedHashMap<>();
        for (CheckoutItemRequest item : request.items()) {
            requestedQuantities.merge(item.productId(), item.quantity(), Integer::sum);
        }

        Map<Product, Integer> products = new LinkedHashMap<>();
        BigDecimal total = BigDecimal.ZERO;
        for (Map.Entry<Long, Integer> entry : requestedQuantities.entrySet()) {
            Product product = productRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy sản phẩm với mã: " + entry.getKey()));
            int quantity = entry.getValue();
            if (product.getDeletedAt() != null || !Integer.valueOf(1).equals(product.getStatus())) {
                throw new BadRequestException("Sản phẩm \"" + product.getName() + "\" hiện không được bán");
            }
            if (product.getQuantity() == null || product.getQuantity() < quantity) {
                throw new BadRequestException("Sản phẩm \"" + product.getName() + "\" không đủ số lượng tồn kho");
            }

            products.put(product, quantity);
            total = total.add(getUnitPrice(product).multiply(BigDecimal.valueOf(quantity)));
        }

        Order order = new Order();
        order.setOrderCode("ORD-" + UUID.randomUUID().toString().replace("-", ""));
        order.setUser(user);
        order.setOrderType("ONLINE");
        order.setTotalAmount(total);
        order.setShippingFee(BigDecimal.ZERO);
        order.setDeliveryAddress(request.deliveryAddress().trim());
        order.setStatus("PENDING");
        order.setNote(request.note());

        for (Map.Entry<Product, Integer> entry : products.entrySet()) {
            Product product = entry.getKey();
            int quantity = entry.getValue();
            BigDecimal unitPrice = getUnitPrice(product);

            product.setQuantity(product.getQuantity() - quantity);
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(unitPrice);
            orderItem.setSubtotal(unitPrice.multiply(BigDecimal.valueOf(quantity)));
            order.getItems().add(orderItem);
        }

        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse update(Long id, OrderRequest request) {
        Order existing = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id: " + id));

        existing.setOrderCode(request.orderCode());
        if (request.orderType() != null) existing.setOrderType(request.orderType());
        if (request.totalAmount() != null) existing.setTotalAmount(request.totalAmount());
        if (request.shippingFee() != null) existing.setShippingFee(request.shippingFee());
        existing.setDeliveryAddress(request.deliveryAddress());
        if (request.status() != null) existing.setStatus(request.status());
        existing.setNote(request.note());
        setRelations(existing, request);

        return orderMapper.toResponse(orderRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy đơn hàng với id: " + id);
        }
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id: " + id));
        order.setDeletedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getDeleted() {
        return orderRepository.findByDeletedAtIsNotNull().stream()
                .map(orderMapper::toResponse).toList();
    }

    @Override
    public void restore(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id: " + id));
        order.setDeletedAt(null);
        orderRepository.save(order);
    }

    @Override
    public void permanentlyDelete(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy đơn hàng với id: " + id);
        }
        orderRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getByStatus(String status) {
        return orderRepository.findByStatusIgnoreCaseAndDeletedAtIsNull(status).stream()
                .map(orderMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getByUserId(Long userId) {
        return orderRepository.findByUserIdAndDeletedAtIsNull(userId).stream()
                .map(orderMapper::toResponse).toList();
    }

    private void setRelations(Order order, OrderRequest request) {
        if (request.userId() != null) {
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + request.userId()));
            order.setUser(user);
        }
        if (request.employeeId() != null) {
            Employee employee = employeeRepository.findById(request.employeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với id: " + request.employeeId()));
            order.setEmployee(employee);
        }
        if (request.tableId() != null) {
            TableEntity table = tableRepository.findById(request.tableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với id: " + request.tableId()));
            order.setTable(table);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));
        return orderRepository.findByUserIdAndDeletedAtIsNull(user.getId()).stream()
                .map(orderMapper::toResponse).toList();
    }

    private BigDecimal getUnitPrice(Product product) {
        BigDecimal salePrice = product.getSalePrice();
        if (salePrice != null && salePrice.compareTo(BigDecimal.ZERO) > 0
                && salePrice.compareTo(product.getPrice()) < 0) {
            return salePrice;
        }
        return product.getPrice();
    }
}
