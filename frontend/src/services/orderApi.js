import api from "./axiosConfig";

export const checkout = (data) => api.post("/orders/checkout", data);
