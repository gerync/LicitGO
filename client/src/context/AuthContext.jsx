import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/config'; 
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Sütik kiolvasása a backend "usertag" sütije alapján
  const syncFromCookies = () => {
    const usertagCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('usertag='))
      ?.split('=')[1];

    if (usertagCookie) {
      setUser({ usertag: decodeURIComponent(usertagCookie) });
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    syncFromCookies();
  }, []);

  const register = async (formData) => {
    try {
      const response = await api.post('/auth/register', formData);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Hiba a regisztráció során.");
      }
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const login = async (identifier, password, keeplogin) => {
    try {
      const response = await api.post('/auth/login', { identifier, password, keeplogin });
      const data = await response.json();

      // 2FA ellenőrzés 
      if (response.status === 203) {
        sessionStorage.setItem('tfa_temp_token', data.temp_token);
        sessionStorage.setItem('tfa_keeplogin', keeplogin);
        toast.success("Kétlépcsős azonosítás szükséges!");
        navigate('/verify-2fa');
        return { requires2FA: true };
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || "Hibás bejelentkezési adatok!");
      }

      syncFromCookies();
      toast.success("Sikeres bejelentkezés!");
      return { requires2FA: false };
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Kijelentkezés hiba:", error);
    } finally {
      setUser(null);
      document.cookie = "usertag=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      toast.success("Kijelentkeztél!");
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, syncFromCookies }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);