// Auth reale contro backend/api (com.reflct.api.auth / com.reflct.api.user).
// Equivalente mobile di apps/web/src/app/core/auth/auth.service.ts.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../api/client';
import { LoginRequest, RegisterRequest, UpdateUserRequest, UserResponse } from '../api/models';

interface AuthContextValue {
  user: UserResponse | null;
  /** true finche' non e' stato fatto il primo tentativo di ripristino sessione. */
  loading: boolean;
  isAuthenticated: boolean;
  register: (req: RegisterRequest) => Promise<void>;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateMe: (req: UpdateUserRequest) => Promise<UserResponse>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.get<UserResponse>('/users/me');
        setUser(me);
      } catch {
        await clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      register: async (req) => {
        const res = await api.post<{ token: string }>('/auth/register', req, false);
        await setToken(res.token);
        const me = await api.get<UserResponse>('/users/me');
        setUser(me);
      },
      login: async (req) => {
        const res = await api.post<{ token: string }>('/auth/login', req, false);
        await setToken(res.token);
        const me = await api.get<UserResponse>('/users/me');
        setUser(me);
      },
      logout: async () => {
        await clearToken();
        setUser(null);
      },
      updateMe: async (req) => {
        const me = await api.patch<UserResponse>('/users/me', req);
        setUser(me);
        return me;
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return ctx;
}
