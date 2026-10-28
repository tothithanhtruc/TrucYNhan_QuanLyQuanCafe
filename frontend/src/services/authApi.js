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

export const getCurrentUserRole = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload.role || payload.roles || payload.authorities;
    if (Array.isArray(role)) return role[0]?.replace(/^ROLE_/i, "").toUpperCase() || null;
    return typeof role === "string" ? role.replace(/^ROLE_/i, "").toUpperCase() : null;
  } catch (error) {
    console.error("Không thể đọc quyền từ token đăng nhập:", error);
    return null;
  }
};

export const isAdmin = () => getCurrentUserRole() === "ADMIN";
