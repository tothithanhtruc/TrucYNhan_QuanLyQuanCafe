
package com.example.TrucYNhan_QuanLyQuanCafe.service.impl;

import com.example.TrucYNhan_QuanLyQuanCafe.config.VNPayConfig;
import com.example.TrucYNhan_QuanLyQuanCafe.dto.VNPayResponse;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Order;
import com.example.TrucYNhan_QuanLyQuanCafe.entity.Payment;
import com.example.TrucYNhan_QuanLyQuanCafe.exception.ResourceNotFoundException;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.OrderRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.repository.PaymentRepository;
import com.example.TrucYNhan_QuanLyQuanCafe.service.VNPayService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

@Service
@Transactional
public class VNPayServiceImpl implements VNPayService {

    private final VNPayConfig vnPayConfig;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public VNPayServiceImpl(
            VNPayConfig vnPayConfig,
            OrderRepository orderRepository,
            PaymentRepository paymentRepository
    ) {
        this.vnPayConfig = vnPayConfig;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    // =====================================================
    // 1. TẠO URL THANH TOÁN VNPAY
    // =====================================================

    @Override
    public String createPaymentUrl(
            String orderCode,
            String bankCode,
            HttpServletRequest request
    ) {

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy đơn hàng với mã: " + orderCode
                        )
                );

        // Số tiền phải nhân 100 theo chuẩn VNPay
        long amount = order.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        Map<String, String> params = new HashMap<>();

        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", order.getOrderCode());
        params.put(
                "vnp_OrderInfo",
                "Thanh toan don hang " + order.getOrderCode()
        );
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

        // Ngân hàng khách hàng lựa chọn
        if (bankCode != null && !bankCode.isBlank()) {
            params.put("vnp_BankCode", bankCode.trim());
        }

        // Thời gian Việt Nam
        Calendar calendar = Calendar.getInstance(
                TimeZone.getTimeZone("Asia/Ho_Chi_Minh")
        );

        SimpleDateFormat formatter =
                new SimpleDateFormat("yyyyMMddHHmmss");

        formatter.setTimeZone(
                TimeZone.getTimeZone("Asia/Ho_Chi_Minh")
        );

        params.put(
                "vnp_CreateDate",
                formatter.format(calendar.getTime())
        );

        calendar.add(Calendar.MINUTE, 15);

        params.put(
                "vnp_ExpireDate",
                formatter.format(calendar.getTime())
        );

        // Xóa tham số rỗng
        params.entrySet().removeIf(entry ->
                entry.getValue() == null ||
                entry.getValue().isBlank()
        );

        // Tạo riêng chuỗi ký và chuỗi URL
        String hashData = buildHashData(params);
        String query = buildQueryString(params);

        // Tạo chữ ký HMAC SHA512
        String secureHash = VNPayConfig.hmacSHA512(
                vnPayConfig.getHashSecret(),
                hashData
        );

        // Tạo URL thanh toán
        return vnPayConfig.getPayUrl()
                + "?"
                + query
                + "&vnp_SecureHash="
                + secureHash;
    }

    // =====================================================
    // 2. XÁC MINH KẾT QUẢ THANH TOÁN VNPAY
    // =====================================================

    @Override
    public VNPayResponse verifyPayment(Map<String, String> params) {

        String secureHash = params.get("vnp_SecureHash");

        String orderCode = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");
        String transactionNo = params.get("vnp_TransactionNo");
        String bankCode = params.get("vnp_BankCode");
        String payDate = params.get("vnp_PayDate");
        String rawAmount = params.get("vnp_Amount");

        String displayAmount = "";

        // Chuyển số tiền về đơn vị VND
        if (rawAmount != null) {
            try {
                long amount = Long.parseLong(rawAmount) / 100;
                displayAmount = String.valueOf(amount);
            } catch (NumberFormatException e) {
                displayAmount = rawAmount;
            }
        }

        // Loại bỏ chữ ký khỏi danh sách tham số cần xác minh
        Map<String, String> fields = new HashMap<>();

        for (Map.Entry<String, String> entry : params.entrySet()) {

            String key = entry.getKey();
            String value = entry.getValue();

            if (value != null
                    && !value.isBlank()
                    && !key.equals("vnp_SecureHash")
                    && !key.equals("vnp_SecureHashType")) {

                fields.put(key, value);
            }
        }

        // Tạo lại chuỗi ký theo chuẩn VNPay
        String hashData = buildHashData(fields);

        // Tính chữ ký từ Secret Key
        String signValue = VNPayConfig.hmacSHA512(
                vnPayConfig.getHashSecret(),
                hashData
        );

        // So sánh chữ ký
        boolean isValidSignature =
                secureHash != null
                && signValue.equalsIgnoreCase(secureHash);

        // Chữ ký không hợp lệ thì không cập nhật đơn hàng
        if (!isValidSignature) {
            return new VNPayResponse(
                    false,
                    "Chữ ký xác thực VNPay không hợp lệ!",
                    orderCode,
                    transactionNo,
                    displayAmount,
                    bankCode,
                    payDate,
                    responseCode
            );
        }

        // Kiểm tra mã đơn hàng
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy đơn hàng: " + orderCode
                        )
                );

        // Kiểm tra số tiền VNPay trả về
        if (rawAmount == null) {
            return new VNPayResponse(
                    false,
                    "Không nhận được số tiền thanh toán!",
                    orderCode,
                    transactionNo,
                    displayAmount,
                    bankCode,
                    payDate,
                    responseCode
            );
        }

        long expectedAmount = order.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        if (!String.valueOf(expectedAmount).equals(rawAmount)) {
            return new VNPayResponse(
                    false,
                    "Số tiền thanh toán không khớp với đơn hàng!",
                    orderCode,
                    transactionNo,
                    displayAmount,
                    bankCode,
                    payDate,
                    responseCode
            );
        }

        // Kiểm tra kết quả giao dịch
        if (!"00".equals(responseCode)
                || !"00".equals(transactionStatus)) {

            String errorMessage = getErrorMessage(responseCode);

            return new VNPayResponse(
                    false,
                    errorMessage,
                    orderCode,
                    transactionNo,
                    displayAmount,
                    bankCode,
                    payDate,
                    responseCode
            );
        }

        // =================================================
        // THANH TOÁN THÀNH CÔNG
        // =================================================

        order.setStatus("CONFIRMED");

        if (order.getNote() != null
                && !order.getNote().contains("VNPAY")) {

            order.setNote(
                    order.getNote()
                    + " | Đã thanh toán qua VNPAY ("
                    + transactionNo + ")"
            );

        } else if (order.getNote() == null) {

            order.setNote(
                    "Đã thanh toán qua VNPAY ("
                    + transactionNo + ")"
            );
        }

        orderRepository.save(order);

        // Lưu lịch sử thanh toán
        Payment payment = new Payment();

        payment.setOrder(order);
        payment.setPaymentMethod("VNPAY");
        payment.setAmount(order.getTotalAmount());
        payment.setTransactionCode(transactionNo);
        payment.setStatus("COMPLETED");
        payment.setPaymentDate(LocalDateTime.now());

        paymentRepository.save(payment);

        return new VNPayResponse(
                true,
                "Thanh toán thành công qua VNPAY Sandbox!",
                orderCode,
                transactionNo,
                displayAmount,
                bankCode,
                payDate,
                "00"
        );
    }

    // =====================================================
    // 3. GIẢ LẬP THANH TOÁN THÀNH CÔNG
    // =====================================================

    @Override
    public Map<String, Object> simulatePaymentSuccess(
            String orderCode,
            String bankCode,
            String cardNumber,
            String cardHolder
    ) {

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy đơn hàng với mã: " + orderCode
                        )
                );

        String transactionNo = "VNP" + System.currentTimeMillis();

        // Cập nhật đơn hàng
        order.setStatus("CONFIRMED");

        // Chỉ lưu 4 số cuối của thẻ
        String cardInfo =
                (bankCode != null && !bankCode.isBlank()
                        ? bankCode
                        : "NCB")
                + " - "
                + (cardNumber != null && cardNumber.length() > 4
                        ? cardNumber.substring(cardNumber.length() - 4)
                        : "SANDBOX");

        if (order.getNote() != null
                && !order.getNote().contains("VNPAY")) {

            order.setNote(
                    order.getNote()
                    + " | Đã thanh toán qua VNPAY ("
                    + cardInfo + ")"
            );

        } else if (order.getNote() == null) {

            order.setNote("Đã thanh toán qua VNPAY (" + cardInfo + ")");
        }

        orderRepository.save(order);

        // Lưu lịch sử thanh toán giả lập
        Payment payment = new Payment();

        payment.setOrder(order);
        payment.setPaymentMethod("VNPAY");
        payment.setAmount(order.getTotalAmount());
        payment.setTransactionCode(transactionNo);
        payment.setStatus("COMPLETED");
        payment.setPaymentDate(LocalDateTime.now());

        paymentRepository.save(payment);

        // Tạo dữ liệu giả lập VNPay trả về
        long amount = order.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        Calendar calendar = Calendar.getInstance(
                TimeZone.getTimeZone("Asia/Ho_Chi_Minh")
        );

        SimpleDateFormat formatter =
                new SimpleDateFormat("yyyyMMddHHmmss");

        formatter.setTimeZone(
                TimeZone.getTimeZone("Asia/Ho_Chi_Minh")
        );

        String payDate = formatter.format(calendar.getTime());

        Map<String, String> params = new HashMap<>();

        params.put("vnp_Amount", String.valueOf(amount));

        params.put(
                "vnp_BankCode",
                bankCode != null && !bankCode.isBlank()
                        ? bankCode.trim()
                        : "NCB"
        );

        params.put("vnp_BankTranNo", transactionNo);
        params.put("vnp_CardType", "ATM");

        params.put(
                "vnp_OrderInfo",
                "Thanh toan don hang " + order.getOrderCode()
        );

        params.put("vnp_PayDate", payDate);
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        params.put("vnp_TransactionNo", transactionNo);
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_TxnRef", order.getOrderCode());

        // Tạo riêng chuỗi ký và chuỗi URL
        String hashData = buildHashData(params);
        String query = buildQueryString(params);

        // Tạo chữ ký giả lập
        String secureHash = VNPayConfig.hmacSHA512(
                vnPayConfig.getHashSecret(),
                hashData
        );

        // URL quay lại website
        String redirectUrl = vnPayConfig.getReturnUrl()
                + "?"
                + query
                + "&vnp_SecureHash="
                + secureHash;

        return Map.of(
                "success", true,
                "message", "Thanh toán thành công qua VNPAY Sandbox!",
                "orderCode", order.getOrderCode(),
                "transactionNo", transactionNo,
                "amount", order.getTotalAmount(),
                "redirectUrl", redirectUrl
        );
    }

    // =====================================================
    // 4. TẠO CHUỖI DÙNG ĐỂ KÝ
    // =====================================================

    private String buildHashData(Map<String, String> params) {

        List<String> fieldNames = new ArrayList<>(params.keySet());

        Collections.sort(fieldNames);

        StringBuilder result = new StringBuilder();

        for (String fieldName : fieldNames) {

            String fieldValue = params.get(fieldName);

            if (fieldValue == null || fieldValue.isBlank()) {
                continue;
            }

            if (result.length() > 0) {
                result.append('&');
            }

            // Tên tham số giữ nguyên, chỉ encode giá trị
            result.append(fieldName)
                    .append('=')
                    .append(URLEncoder.encode(
                            fieldValue,
                            StandardCharsets.US_ASCII
                    ));
        }

        return result.toString();
    }

    // =====================================================
    // 5. TẠO CHUỖI QUERY DÙNG CHO URL
    // =====================================================

    private String buildQueryString(Map<String, String> params) {

        List<String> fieldNames = new ArrayList<>(params.keySet());

        Collections.sort(fieldNames);

        StringBuilder result = new StringBuilder();

        for (String fieldName : fieldNames) {

            String fieldValue = params.get(fieldName);

            if (fieldValue == null || fieldValue.isBlank()) {
                continue;
            }

            if (result.length() > 0) {
                result.append('&');
            }

            // Encode cả tên và giá trị khi tạo URL
            result.append(URLEncoder.encode(
                            fieldName,
                            StandardCharsets.US_ASCII
                    ))
                    .append('=')
                    .append(URLEncoder.encode(
                            fieldValue,
                            StandardCharsets.US_ASCII
                    ));
        }

        return result.toString();
    }

    // =====================================================
    // 6. THÔNG BÁO LỖI THANH TOÁN
    // =====================================================

    private String getErrorMessage(String responseCode) {

        if (responseCode == null) {
            return "Giao dịch không thành công!";
        }

        return switch (responseCode) {

            case "07" ->
                    "Trừ tiền thành công. Giao dịch bị nghi ngờ bất thường.";

            case "09" ->
                    "Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking.";

            case "10" ->
                    "Khách hàng xác thực thông tin thẻ không đúng quá 3 lần.";

            case "11" ->
                    "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại.";

            case "12" ->
                    "Thẻ/Tài khoản của khách hàng bị khóa.";

            case "24" ->
                    "Giao dịch đã bị hủy bởi khách hàng.";

            case "51" ->
                    "Tài khoản không đủ số dư để thực hiện giao dịch.";

            case "65" ->
                    "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.";

            case "75" ->
                    "Ngân hàng thanh toán đang bảo trì.";

            case "79" ->
                    "Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định.";

            default ->
                    "Thanh toán không thành công. Mã lỗi VNPay: "
                    + responseCode;
        };
    }
}
