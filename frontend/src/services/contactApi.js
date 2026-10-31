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
 * Lấy các liên hệ trong thùng rác → GET /api/contacts/trash
 */
export const getTrashContacts = () => api.get("/contacts/trash");

/**
 * Lấy phản hồi liên hệ của tài khoản đang đăng nhập
 */
export const getMyContactReplies = () => api.get("/contacts/inbox");

/**
 * Lấy chi tiết liên hệ theo ID → GET /api/contacts/{id}
 */
export const getContactById = (id) => api.get(`/contacts/${id}`);

/**
 * Lưu phản hồi của admin → PUT /api/contacts/{id}/reply
 */
export const replyToContact = (id, reply) =>
  api.put(`/contacts/${id}/reply`, { reply });

/**
 * Lưu một tin nhắn trong cuộc trò chuyện của liên hệ
 */
export const sendContactMessage = (id, reply) =>
  api.post(`/contacts/${id}/messages`, { reply });

/**
 * Chuyển liên hệ vào thùng rác → DELETE /api/contacts/{id}
 */
export const deleteContact = (id) => api.delete(`/contacts/${id}`);

/**
 * Khôi phục liên hệ → PUT /api/contacts/{id}/restore
 */
export const restoreContact = (id) => api.put(`/contacts/${id}/restore`);

/**
 * Xóa vĩnh viễn liên hệ trong thùng rác → DELETE /api/contacts/{id}/force-delete
 */
export const forceDeleteContact = (id) =>
  api.delete(`/contacts/${id}/force-delete`);
