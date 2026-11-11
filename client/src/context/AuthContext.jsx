import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authService.getMe();
      setUser(data.user);
      setIsRegistered(data.isRegistered);
      setIsAdmin(Boolean(data.isAdmin));
    } catch {
      setUser(null);
      setIsRegistered(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    await refreshUser();
    return response;
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try { await authService.logout(); } finally {
      setUser(null);
      setIsRegistered(false);
      setIsAdmin(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, setUser, isRegistered, setIsRegistered, isAdmin, loading, isAuthenticated: Boolean(user), login, logout, refreshUser }),
    [user, isRegistered, isAdmin, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};