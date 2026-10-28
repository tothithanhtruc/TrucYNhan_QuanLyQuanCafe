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
  const token = localStorage.getItem("token")?.trim();
  if (token) {
    const authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
    config.headers.set("Authorization", authorization);
  }
  return config;
});

export default api;
