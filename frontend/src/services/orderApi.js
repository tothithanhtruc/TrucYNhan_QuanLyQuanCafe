import api from "./axiosConfig";

export const checkout = (data) => api.post("/orders/checkout", data);

/** Lấy đơn hàng của người dùng đang đăng nhập */
export const getMyOrders = () => api.get("/orders/my-orders");
