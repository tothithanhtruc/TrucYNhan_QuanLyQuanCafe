import api from "./axiosConfig";

/**
 * Lấy tất cả bài viết → GET /api/posts
 */
export const getPosts = () => api.get("/posts");

/**
 * Lấy chi tiết bài viết theo ID → GET /api/posts/{id}
 */
export const getPostById = (id) => api.get(`/posts/${id}`);
