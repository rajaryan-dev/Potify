import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the httpOnly cookie on page load
  useEffect(() => {
    let active = true;
    authApi
      .me()
      .then((d) => active && setUser(d.user))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Axios interceptor fires this when an API call comes back 401 (session expired)
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (body) => {
    const d = await authApi.login(body);
    setUser(d.user);
  }, []);

  const register = useCallback(async (body) => {
    const d = await authApi.register(body);
    setUser(d.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
