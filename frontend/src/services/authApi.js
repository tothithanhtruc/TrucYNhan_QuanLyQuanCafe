import api from "./axiosConfig";
import { getTokenClaims, getUsableToken } from "../utils/token";

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
  if (token) {
    localStorage.setItem("token", token);
    window.dispatchEvent(new Event("auth-changed"));
  }
  return res;
};

export const logout = () => {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("auth-changed"));
};

export const getToken = getUsableToken;
export const isLoggedIn = () => !!getUsableToken();

export const getCurrentUserRole = () => {
  const token = getUsableToken();
  if (!token) return null;

  const payload = getTokenClaims(token);
  const role = payload?.role || payload?.roles || payload?.authorities;
  if (Array.isArray(role)) return role[0]?.replace(/^ROLE_/i, "").toUpperCase() || null;
  return typeof role === "string" ? role.replace(/^ROLE_/i, "").toUpperCase() : null;
};

export const getCurrentUsername = () => {
  const token = getUsableToken();
  return token ? getTokenClaims(token)?.sub ?? null : null;
};

export const isAdmin = () => getCurrentUserRole() === "ADMIN";
