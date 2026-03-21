'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiFetch } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'free' | 'pro' | 'admin';
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isPro: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('gn_user');
    const storedToken = localStorage.getItem('gn_token');
    if (stored && storedToken) {
      try {
        setUser(JSON.parse(stored));
        setToken(storedToken);
      } catch {
        localStorage.removeItem('gn_user');
        localStorage.removeItem('gn_token');
      }
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await apiFetch<{
      data: { user: { id: string; email: string; profile: UserProfile }; session: { access_token: string } };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    });

    const profile: UserProfile = {
      id: res.data.user.id,
      email: res.data.user.email,
      name: res.data.user.profile?.name || email.split('@')[0],
      role: res.data.user.profile?.role || 'free',
    };

    localStorage.setItem('gn_token', res.data.session.access_token);
    localStorage.setItem('gn_user', JSON.stringify(profile));
    setToken(res.data.session.access_token);
    setUser(profile);
  }

  async function register(email: string, password: string, name: string) {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
      auth: false,
    });
  }

  function logout() {
    localStorage.removeItem('gn_token');
    localStorage.removeItem('gn_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
        isPro: user?.role === 'pro' || user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
