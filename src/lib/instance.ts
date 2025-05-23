import axios from "axios";


export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_POCKETBASE,
  headers: {
    "Content-Type": "application/json",
  },
});


instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pocketbase_auth");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
