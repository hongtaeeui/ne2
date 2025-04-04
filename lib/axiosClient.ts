import axios from "axios";
import useAuthStore from "./store/authStore";

const axiosClient = axios.create({
  baseURL: "/api", // Next.js API Route로 요청
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
