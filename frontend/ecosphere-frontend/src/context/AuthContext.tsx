import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi, saveToken, clearToken, getSavedUser } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Employee' | 'Manager' | 'Admin';
  department?: string;
  xp: number;
  points: number;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: Record<string, string>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ecosphere_token');
    const savedUser = getSavedUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser as User);
      // Verify with server
      authApi.me().then(res => {
        setUser(res.user as User);
        setPermissions(res.permissions);
      }).catch(() => {
        // Token expired or invalid — clear
        clearToken();
        setToken(null);
        setUser(null);
      }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user as User);
    setPermissions(res.permissions);
    saveToken(res.token, res.user);
  }, []);

  const signup = useCallback(async (data: Record<string, string>) => {
    const res = await authApi.signup(data);
    setToken(res.token);
    setUser(res.user as User);
    setPermissions(res.permissions);
    saveToken(res.token, res.user);
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    clearToken();
    setToken(null);
    setUser(null);
    setPermissions([]);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      permissions,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
