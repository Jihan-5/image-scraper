import { useAuth } from '../contexts/AuthContext';

export const useAuthCheck = () => {
  const { user } = useAuth();
  return { isAuthenticated: !!user };
};