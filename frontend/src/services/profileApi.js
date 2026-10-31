import api from "./axiosConfig";

/** Lấy thông tin hồ sơ cá nhân */
export const getMyProfile = () => api.get("/users/me");

/** Cập nhật hồ sơ cá nhân */
export const updateMyProfile = (data) => api.put("/users/me", data);

/** Tải ảnh hồ sơ lên máy chủ */
export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/uploads/image", formData);
};
