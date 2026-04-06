import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const readCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const syncFromCookies = async () => {
    const usertag = readCookie('usertag');
    if (!usertag) {
      setUser(null);
      localStorage.removeItem('user');
      return null;
    }
    try {
      const profile = await apiFetch(`/user/profile/${usertag}`, { method: 'GET' });
      const userObj = { usertag: profile.usertag, fullname: profile.fullname, pfp: profile.pfp };
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      return userObj;
    } catch (e) {
      setUser(null);
      localStorage.removeItem('user');
      return null;
    }
  };
  useEffect(() => {
    if (!user) {
      syncFromCookies().catch(() => {});
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: credentials, 
      });

      // Prefer explicit user info from response; otherwise fall back to syncing from cookies
      const userData = response.user || await syncFromCookies();
      if (userData) {
        const userObj = response.user || userData;
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
      }
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
    <AuthContext.Provider value={{ user, login, register, logout, syncFromCookies }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);