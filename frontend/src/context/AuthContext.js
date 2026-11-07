import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (getToken()) {
        try {
          const me = await api.me();
          setUser(me);
        } catch {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    setUser(null);
    localStorage.removeItem('token');
    const { token, user } = await api.login({ email, password });
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const register = async (data) => {
    setUser(null);
    localStorage.removeItem('token');
    const { token, user } = await api.register(data);
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);