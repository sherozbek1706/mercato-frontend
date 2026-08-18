import axios from "axios";

const api = axios.create({
  // baseURL: `${import.meta.env.VITE_API_URL}`,
  baseURL: `https://mercato-backend-9n0y.onrender.com/api`,
});

// Interceptor for attaching token
api.interceptors.request.use(
  (config) => {
    if (config.url && config.url.includes("/admin")) {
      const adminToken = localStorage.getItem("adminToken");
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
