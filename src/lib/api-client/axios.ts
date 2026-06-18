import axios from "axios";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === "undefined") return Promise.reject(error);

    const status = error.response?.status;

    if (status === 401) {
      window.location.href = "/signin";
    } else if (status === 429) {
      toast.error("You're doing that too fast. Please slow down.");
    }

    return Promise.reject(error);
  },
);
