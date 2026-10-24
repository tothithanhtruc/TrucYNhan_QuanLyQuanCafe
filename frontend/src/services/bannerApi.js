import api from "./axiosConfig";

/** GET /api/banners  → { message, data: Banner[] } */
export const getBanners = () => api.get("/banners");
