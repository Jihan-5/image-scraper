import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, register as authRegister, getCurrentUser } from '../api/auth';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { email: string; password: string; username: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Fetch the current user on mount if token exists
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch {
        setUser(null);
      }
    };
    initializeUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const response = await authLogin(credentials);
    localStorage.setItem('token', response.data.access_token);
    const me = await getCurrentUser();
    setUser(me.data);
  };

  const register = async (userData: { email: string; password: string; username: string }) => {
    await authRegister(userData);
    await login({ email: userData.email, password: userData.password });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
