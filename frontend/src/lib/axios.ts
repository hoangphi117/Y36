import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // XÓA x-api-key ở đây để tránh xung đột merge config
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const apiKey = import.meta.env.VITE_API_KEY;

  // [DEBUG] Kiểm tra xem key có tồn tại không.
  // Nếu thấy dòng này trong Console, bạn cần kiểm tra lại file .env
  if (!apiKey) {
    console.error("❌ VITE_API_KEY không tìm thấy! Kiểm tra file .env");
  }

  // Đảm bảo headers luôn tồn tại
  if (!config.headers) {
    config.headers = new axios.AxiosHeaders();
  }

  // [FIX] Luôn set API Key tại đây, nó sẽ không bị ghi đè bởi useUser
  config.headers.set("x-api-key", apiKey);

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

export default axiosClient;
