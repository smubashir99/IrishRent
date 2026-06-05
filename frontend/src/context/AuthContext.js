import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

// Ref: https://react.dev/reference/react/createContext
const AuthContext = createContext();

// Ref: https://react.dev/reference/react/createContext
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));
// Note: On initial load, we check if a token exists in localStorage. If it does, we attempt to load the user profile to verify the token and get user info. If it fails (e.g. token is invalid/expired), we clear the token and user state.
    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const res = await authAPI.getMe();
            setUser(res.data.user);
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };
    // Note: The login and register functions both call the respective API endpoints, store the returned token and user info in localStorage, and update the context state. The logout function clears all authentication data.

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        return user;
    };
// Note: The register function is similar to login but calls the register endpoint. After successful registration, it also logs the user in by storing the token and user info.
    const register = async (data) => {
        const res = await authAPI.register(data);
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        return user;
    };
// Note: The logout function simply clears the token and user info from localStorage and resets the context state, effectively logging the user out.
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };
// Note: The context provider value includes the user object, token, loading state, and the authentication functions. The isAuthenticated boolean is derived from whether a user object exists.
    return (
        <AuthContext.Provider value={{
            user, token, loading,
            login, register, logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};