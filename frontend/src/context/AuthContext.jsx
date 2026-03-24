import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('loom_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('loom_user') || 'null'));

  const value = useMemo(
    () => ({
      token,
      user,
      login: (session) => {
        setToken(session.token);
        setUser(session.user);
        localStorage.setItem('loom_token', session.token);
        localStorage.setItem('loom_user', JSON.stringify(session.user));
      },
      logout: () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('loom_token');
        localStorage.removeItem('loom_user');
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
