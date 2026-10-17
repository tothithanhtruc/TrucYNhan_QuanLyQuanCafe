
package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.PaymentRequest;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.PaymentResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Order;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Payment;
import com.example.TrucYNhan_QuanLyQuanCafe.mapper.PaymentMapper;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.OrderRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.PaymentRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentMapper paymentMapper;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            PaymentMapper paymentMapper) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.paymentMapper = paymentMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> findAll() {
        return paymentRepository.findAll()
                .stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse findById(Long id) {
        return paymentMapper.toResponse(getPayment(id));
    }

    @Override
    public PaymentResponse create(PaymentRequest request) {
        Payment payment = new Payment();
        applyRequest(payment, request);

        if (payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDateTime.now());
        }

        if (payment.getStatus() == null || payment.getStatus().isBlank()) {
            payment.setStatus("PENDING");
        }

        return paymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    public PaymentResponse update(Long id, PaymentRequest request) {
        Payment payment = getPayment(id);
        applyRequest(payment, request);

        return paymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    public void delete(Long id) {
        Payment payment = getPayment(id);
        paymentRepository.delete(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> findByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> findByStatus(String status) {
        return paymentRepository.findByStatusIgnoreCase(status)
                .stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    private Payment getPayment(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy thanh toán có ID: " + id
                ));
    }

    private void applyRequest(Payment payment, PaymentRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy đơn hàng có ID: " + request.orderId()
                ));

        payment.setOrder(order);
        payment.setPaymentMethod(request.paymentMethod());
        payment.setAmount(request.amount());
        payment.setTransactionCode(request.transactionCode());

        if (request.status() != null && !request.status().isBlank()) {
            payment.setStatus(request.status());
        }
    }
}
