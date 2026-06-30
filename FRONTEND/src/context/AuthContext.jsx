import React, { createContext, useState, useEffect } from "react";
import { connectSocket, disconnectSocket } from "../config/socket.js";

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

    let storedToken = localStorage.getItem('access_token');
    
    // Parche de seguridad (Escudo Anti-Softlock):
    // Si el token se guardó corrupto ('undefined') o si existe un token pero NO hay usuario guardado
    if (storedToken === 'undefined' || (storedToken && !initialUser)) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        storedToken = null;
        initialUser = null;
    }

    const [token, setToken] = useState(storedToken);
    const [user, setUser] = useState(initialUser);
    
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [activeSocket, setActiveSocket] = useState(null);

    // Conectar socket automáticamente si hay token al cargar
    useEffect(() => {
        if (token) {
            const s = connectSocket();
            setActiveSocket(s);
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
        <AuthContext.Provider value={{ token, user, isAuthenticated, loginUser, logoutUser, activeSocket }}>
            {children}
        </AuthContext.Provider>
    );
};
