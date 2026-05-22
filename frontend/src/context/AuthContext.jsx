import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// T03 HU11: token en localStorage bajo claves con prefijo fh_
export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('fh_token');
    const storedUser  = localStorage.getItem('fh_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('fh_token');
        localStorage.removeItem('fh_user');
      }
    }
    setLoading(false);
  }, []);

  function login(newToken, newUser) {
    localStorage.setItem('fh_token', newToken);
    localStorage.setItem('fh_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('fh_token');
    localStorage.removeItem('fh_user');
    setToken(null);
    setUser(null);
  }

  // T09: expone rol del usuario autenticado (user?.rol)
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
