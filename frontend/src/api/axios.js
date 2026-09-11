import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://al-maarif-education-system.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ame_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ame_token");
      localStorage.removeItem("ame_principal");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
