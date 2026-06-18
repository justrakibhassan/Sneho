import axios from "axios";

// আপনার ব্যাকএন্ডের ঠিকানা
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const proxy = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// রিকোয়েস্ট ইন্টারসেপ্টর: প্রতি কলে টোকেন যুক্ত করবে
proxy.interceptors.request.use(
  (config) => {
    // সার্ভার সাইড রেন্ডারিং এড়াতে উইন্ডো চেক
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// রেসপন্স ইন্টারসেপ্টর: 401 হলে লগআউট করাবে
proxy.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // টোকেন এক্সপায়ার হলে লগআউট
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default proxy;
