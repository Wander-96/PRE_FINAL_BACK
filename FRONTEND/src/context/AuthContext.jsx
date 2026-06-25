import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    
    // Leer estado inicial de LocalStorage
    let initialUser = null;
    try {
        const stored = localStorage.getItem('user');
        if (stored && stored !== "undefined") {
            initialUser = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error leyendo user de localStorage", e);
    }

    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [user, setUser] = useState(initialUser);
    
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    const loginUser = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        localStorage.setItem('access_token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logoutUser = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
