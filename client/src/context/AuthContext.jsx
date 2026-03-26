import { createContext, useContext, useState } from 'react';
import { apiFetch } from '../api/config';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (credentials) => {
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: credentials, 
      });

      const userData = response.user || response;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return response;
    } catch (error) {
      console.error('Bejelentkezési hiba:', error);
      throw error.data?.message || 'Sikertelen bejelentkezés.';
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: userData,
      });
      return response;
    } catch (error) {
      console.error('Regisztrációs hiba:', error);
      throw error.data?.message || 'Sikertelen regisztráció.';
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      toast.success("Sikeres kijelentkezés!");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);