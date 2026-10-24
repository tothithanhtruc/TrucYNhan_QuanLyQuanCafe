import axios from "axios";

/**
 * Axios instance – proxy /api → http://localhost:8081/api (qua vite.config.js)
 * Tự động gắn JWT token nếu có trong localStorage
 */
const api = axios.create({
  baseURL: "/api",        // dùng Vite proxy, tránh CORS
  timeout: 8000,
});

// Interceptor: gắn Bearer token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
