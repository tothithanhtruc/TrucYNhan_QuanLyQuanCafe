import api from "./axiosConfig";

/** GET /api/categories  → { message, data: Category[] } */
export const getCategories = () => api.get("/categories");

/** GET /api/categories/{id} */
export const getCategoryById = (id) => api.get(`/categories/${id}`);
