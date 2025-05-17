import { api } from "../api/api";

export interface User {
    email: string;
    username: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  export const login = async (credentials: { email: string; password: string }) => {
    const response = await api.post<{ token: string }>('/auth/login', credentials);
    return response.data;
  };