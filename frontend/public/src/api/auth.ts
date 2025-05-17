// src/api/auth.ts
import axios from "axios";

// Use CRA-style env var, falling back to localhost
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
});

export const login = (credentials: {
  email: string;
  password: string;
}) => authApi.post("/token", credentials);

export const register = (userData: {
  email: string;
  password: string;
  username: string;
}) => authApi.post("/register", userData);

export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return Promise.reject(new Error("No authentication token found"));
  }
  return authApi.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
