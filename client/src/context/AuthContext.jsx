import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast'; 
import { api } from '../api/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const data = await api.get('/user/profile');
            if (data.success) {
                setUser(data.user || data.profile);
            }
        } catch (error) {
            setUser(null);
            
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const data = await api.post('/auth/login', credentials);
            if (data.success) {
                setUser(data.user);
                toast.success('Sikeres bejelentkezés! 👋');
                return { success: true };
            }
        } catch (error) {
            const errorMsg = error.message || 'Hiba a bejelentkezés során';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            toast.success('Sikeres kijelentkezés!');
        } catch (error) {
            toast.error('Hiba a kijelentkezés során');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);