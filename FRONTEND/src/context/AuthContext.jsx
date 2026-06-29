import React, { createContext, useState, useEffect } from "react";
import { connectSocket, disconnectSocket } from "../config/socket";

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

    // Conectar socket automáticamente si hay token al cargar
    useEffect(() => {
        if (token) {
            connectSocket();
        }
        return () => {
            // No desconectar aquí a menos que el usuario cierre sesión
        };
    }, [token]);

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
        disconnectSocket();
    };

    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
