import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export function useAuth() {
  const { token, user, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const handleLogout = () => {
    // Clear all cached queries so data from previous user doesn't bleed into next session
    qc.clear();
    logout();
    navigate('/login', { replace: true });
  };

  return {
    token,
    user,
    isAuthenticated: !!token,
    isAdmin: user?.isAdmin ?? false,
    setAuth,
    logout: handleLogout,
  };
}
