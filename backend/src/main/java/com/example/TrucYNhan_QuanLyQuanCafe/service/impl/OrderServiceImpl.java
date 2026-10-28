package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.OrderRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.OrderResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Order;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.User;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Employee;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.TableEntity;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.OrderMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.OrderRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.UserRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.EmployeeRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.TableRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final TableRepository tableRepository;
    private final OrderMapper orderMapper;

    public OrderServiceImpl(OrderRepository orderRepository,
                            UserRepository userRepository,
                            EmployeeRepository employeeRepository,
                            TableRepository tableRepository,
                            OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
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
}
