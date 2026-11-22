import axios from "axios";

export const BASE_URL =
  typeof window !== "undefined" && window.location.port === "5173"
    ? "http://localhost:7777"
    : "https://devsphere-backend-adr8.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send and receive cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach Bearer token fallback if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("devtinder_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);

export default api;
