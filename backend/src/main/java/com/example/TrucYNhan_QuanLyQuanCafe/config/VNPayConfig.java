
package com.example.TrucYNhan_QuanLyQuanCafe.config;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class VNPayConfig {

    // Mã Terminal Code được VNPay cấp
    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    // Secret Key được VNPay cấp
    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    // Địa chỉ cổng thanh toán Sandbox
    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String payUrl;

    // Địa chỉ quay lại website
    @Value("${vnpay.return-url:http://localhost:5173/payment/vnpay-return}")
    private String returnUrl;

    public String getTmnCode() {
        return tmnCode;
    }

    public String getHashSecret() {
        return hashSecret;
    }

    public String getPayUrl() {
        return payUrl;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    // =====================================================
    // 1. TẠO CHỮ KÝ HMAC SHA512
    // =====================================================

    public static String hmacSHA512(
            final String key,
            final String data
    ) {

        try {
            if (key == null || key.isBlank()
                    || data == null) {
                throw new IllegalArgumentException(
                        "Hash Secret hoặc dữ liệu tạo chữ ký không hợp lệ"
                );
            }

            Mac hmac512 = Mac.getInstance("HmacSHA512");

            byte[] keyBytes =
                    key.getBytes(StandardCharsets.UTF_8);

            SecretKeySpec secretKey =
                    new SecretKeySpec(keyBytes, "HmacSHA512");

            hmac512.init(secretKey);

            byte[] dataBytes =
                    data.getBytes(StandardCharsets.UTF_8);

            byte[] result = hmac512.doFinal(dataBytes);

            StringBuilder sb =
                    new StringBuilder(2 * result.length);

            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }

            return sb.toString();

        } catch (Exception ex) {
            throw new IllegalStateException(
                    "Không thể tạo chữ ký HMAC SHA512",
                    ex
            );
        }
    }

    // =====================================================
    // 2. XÁC MINH CHỮ KÝ VNPAY TRẢ VỀ
    // =====================================================

    public static String hashAllFields(
            Map<String, String> fields,
            String secretKey
    ) {

        Map<String, String> validFields = new HashMap<>();

        for (Map.Entry<String, String> entry : fields.entrySet()) {

            if (entry.getValue() != null
                    && !entry.getValue().isBlank()) {

                validFields.put(
                        entry.getKey(),
                        entry.getValue()
                );
            }
        }

        List<String> fieldNames =
                new ArrayList<>(validFields.keySet());

        // Sắp xếp tên tham số theo thứ tự alphabet
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();

        for (String fieldName : fieldNames) {

            String fieldValue = validFields.get(fieldName);

            if (hashData.length() > 0) {
                hashData.append('&');
            }

            try {
                hashData.append(fieldName);
                hashData.append('=');

                hashData.append(
                        URLEncoder.encode(
                                fieldValue,
                                StandardCharsets.US_ASCII
                        )
                );

            } catch (Exception ex) {
                throw new IllegalStateException(
                        "Lỗi mã hóa dữ liệu VNPay",
                        ex
                );
            }
        }

        return hmacSHA512(secretKey, hashData.toString());
    }

    // =====================================================
    // 3. LẤY ĐỊA CHỈ IP KHÁCH HÀNG
    // =====================================================

    public static String getIpAddress(
            HttpServletRequest request
    ) {

        String ipAddress = request.getHeader("X-FORWARDED-FOR");

        if (ipAddress == null
                || ipAddress.isBlank()
                || "unknown".equalsIgnoreCase(ipAddress)) {

            ipAddress = request.getHeader("Proxy-Client-IP");
        }

        if (ipAddress == null
                || ipAddress.isBlank()
                || "unknown".equalsIgnoreCase(ipAddress)) {

            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }

        if (ipAddress == null
                || ipAddress.isBlank()
                || "unknown".equalsIgnoreCase(ipAddress)) {

            ipAddress = request.getRemoteAddr();
        }

        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        if ("0:0:0:0:0:0:0:1".equals(ipAddress)
                || "::1".equals(ipAddress)) {

            ipAddress = "127.0.0.1";
        }

        return ipAddress;
    }
}
