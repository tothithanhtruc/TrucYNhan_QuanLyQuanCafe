import api from "./axiosConfig";

/**
 * Gửi liên hệ mới → POST /api/contacts
 * data: { name, email, phone, subject, message }
 */
export const sendContact = (data) => api.post("/contacts", data);

/**
 * Lấy tất cả liên hệ → GET /api/contacts (cần quyền hoặc quản trị)
 */
export const getContacts = () => api.get("/contacts");

/**
 * Lấy chi tiết liên hệ theo ID → GET /api/contacts/{id}
 */
export const getContactById = (id) => api.get(`/contacts/${id}`);
