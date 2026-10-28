import api from "./axiosConfig";

/**
 * POST /api/users/register
 */
export const register = (data) => api.post("/users/register", data);

/**
 * POST /api/auth/login  → { token, ... }
 * Lưu token vào localStorage sau khi đăng nhập thành công
 */
export const login = async (username, password) => {
  const res = await api.post("/auth/login", { username, password });
  const token = res.data?.token ?? res.data?.data?.token;
  if (token) localStorage.setItem("token", token);
  return res;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");
export const isLoggedIn = () => !!localStorage.getItem("token");
