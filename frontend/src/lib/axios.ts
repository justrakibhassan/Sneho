import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ৩. রেসপন্স ইন্টারসেপ্টর (Response Interceptor) - অপশনাল
// যদি কখনো টোকেন এক্সপায়ার (401) হয়ে যায়, অটোমেটিক লগআউট করানোর জন্য
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // টোকেন অবৈধ হলে লগআউট করানো (অপশনাল)
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
