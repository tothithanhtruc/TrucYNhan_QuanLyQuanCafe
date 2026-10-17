
package com.example.TrucYNhan_QuanLyQuanCafe.mapper;

import com.example.TrucYNhan_QuanLyQuanCafe.dto.PaymentResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
            payment.getId(),
            payment.getOrder().getId(),
            payment.getPaymentMethod(),
            payment.getAmount(),
            payment.getPaymentDate(),
            payment.getTransactionCode(),
            payment.getStatus(),
            payment.getCreatedAt()
        );
    }
}
