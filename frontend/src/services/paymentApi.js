import api from "./axiosConfig";

/**
 * Tạo URL thanh toán VNPAY
 * data: { orderCode, bankCode }
 */
export const createVNPayPaymentUrl = (data) =>
  api.post("/payment/vnpay/create", data);

/**
 * Mô phỏng xác nhận thanh toán thành công VNPAY Sandbox (Test trực tiếp thẻ NCB)
 * data: { orderCode, bankCode, cardNumber, cardHolder }
 */
export const simulateVNPayPayment = (data) =>
  api.post("/payment/vnpay/simulate-success", data);

/**
 * Xác thực kết quả thanh toán từ VNPAY callback
 * params: object chứa các query params từ URL trả về của VNPAY
 */
export const verifyVNPayCallback = (params) =>
  api.get("/payment/vnpay/callback", { params });
