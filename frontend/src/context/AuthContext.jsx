import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('loom_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('loom_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email, password) {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('loom_token', res.data.token);
        setUser(res.data.user);
      },
      async signup(name, email, password) {
        const res = await api.post('/auth/signup', { name, email, password });
        localStorage.setItem('loom_token', res.data.token);
        setUser(res.data.user);
      },
      async logout() {
        try {
          await api.post('/auth/logout');
        } finally {
          localStorage.removeItem('loom_token');
          setUser(null);
        }
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
