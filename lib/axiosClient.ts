import axios, { AxiosResponse, AxiosError } from "axios";
import useAuthStore from "./store/authStore";

// 내부 API용 axiosClient
const axiosClient = axios.create({
  baseURL: "/api", // Next.js API Route로 요청
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// 외부 API용 axiosClient
const externalAxiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EXTERNAL_API_URL || "http://localhost:3005",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// 내부 API 인터셉터
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("내부 API 요청 설정:", {
    url: config.url,
    headers: config.headers,
    params: config.params,
  });
  return config;
});

// 외부 API 인터셉터
externalAxiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("외부 API 요청 설정:", {
    url: config.url,
    headers: config.headers,
    params: config.params,
  });
  return config;
});

// 공통 응답 인터셉터
const responseInterceptor = (response: AxiosResponse) => response;
const errorInterceptor = (error: AxiosError) => {
  console.error("Axios Error:", error);
  return Promise.reject(error);
};

axiosClient.interceptors.response.use(responseInterceptor, errorInterceptor);
externalAxiosClient.interceptors.response.use(
  responseInterceptor,
  errorInterceptor
);

export { axiosClient as default, externalAxiosClient };
