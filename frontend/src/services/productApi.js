import api from "./axiosConfig";

/** GET /api/products  → { message, data: Product[] } */
export const getProducts = () => api.get("/products");

/** GET /api/products/{id} */
export const getProductById = (id) => api.get(`/products/${id}`);

/** GET /api/products/search?name=... */
export const searchProducts = (name) => api.get("/products/search", { params: { name } });

/** POST /api/products  (ADMIN) */
export const createProduct = (data) => api.post("/products", data);

/** PUT /api/products/{id}  (ADMIN) */
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

/** DELETE /api/products/{id}  (ADMIN) */
export const deleteProduct = (id) => api.delete(`/products/${id}`);
