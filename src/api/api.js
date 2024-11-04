import axios from "axios";
import { checkTokenExpiration, handleAuthError } from "../utils/authHandler";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/user";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && checkTokenExpiration(token)) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject("Token expired");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (handleAuthError(error)) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;
