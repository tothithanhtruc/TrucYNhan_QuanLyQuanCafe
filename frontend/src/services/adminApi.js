import api from "./axiosConfig";

export const adminUploadImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/uploads/image", formData);
};

// Products API
export const adminGetProducts = () => api.get("/products");
export const adminCreateProduct = (data) => api.post("/products", data);
export const adminUpdateProduct = (id, data) => api.put(`/products/${id}`, data);
export const adminDeleteProduct = (id) => api.delete(`/products/${id}`);
export const adminGetDeletedProducts = () => api.get("/products/trash");
export const adminRestoreProduct = (id) => api.patch(`/products/${id}/restore`);
export const adminPermanentlyDeleteProduct = (id) => api.delete(`/products/${id}/permanent`);

// Categories API
export const adminGetCategories = () => api.get("/categories");
export const adminCreateCategory = (data) => api.post("/categories", data);
export const adminUpdateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const adminDeleteCategory = (id) => api.delete(`/categories/${id}`);
export const adminGetDeletedCategories = () => api.get("/categories/trash");
export const adminRestoreCategory = (id) => api.patch(`/categories/${id}/restore`);
export const adminPermanentlyDeleteCategory = (id) => api.delete(`/categories/${id}/permanent`);

// Orders API
export const adminGetOrders = () => api.get("/orders");
export const adminGetOrderById = (id) => api.get(`/orders/${id}`);
export const adminCreateOrder = (data) => api.post("/orders", data);
export const adminUpdateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const adminDeleteOrder = (id) => api.delete(`/orders/${id}`);
export const adminGetDeletedOrders = () => api.get("/orders/trash");
export const adminRestoreOrder = (id) => api.patch(`/orders/${id}/restore`);
export const adminPermanentlyDeleteOrder = (id) => api.delete(`/orders/${id}/permanent`);

// Tables API
export const adminGetTables = () => api.get("/tables");
export const adminGetTableById = (id) => api.get(`/tables/${id}`);
export const adminCreateTable = (data) => api.post("/tables", data);
export const adminUpdateTable = (id, data) => api.put(`/tables/${id}`, data);
export const adminDeleteTable = (id) => api.delete(`/tables/${id}`);

// Users API
export const adminGetUsers = () => api.get("/users");
export const adminCreateUser = (data) => api.post("/users", data);
export const adminUpdateUser = (id, data) => api.put(`/users/${id}`, data);
export const adminGetUserById = (id) => api.get(`/users/${id}`);

// Posts API
export const adminGetPosts = () => api.get("/posts");
export const adminCreatePost = (data) => api.post("/posts", data);
export const adminUpdatePost = (id, data) => api.put(`/posts/${id}`, data);
export const adminSoftDeletePost = (id) => api.delete(`/posts/${id}`);
export const adminGetDeletedPosts = () => api.get("/posts/trash");
export const adminRestorePost = (id) => api.put(`/posts/${id}/restore`);
export const adminPermanentlyDeletePost = (id) => api.delete(`/posts/${id}/permanent`);
export const adminGetTopics = () => api.get("/topics");
