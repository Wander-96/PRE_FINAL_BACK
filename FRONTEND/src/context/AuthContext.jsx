import React, { createContext, useState } from "react";

// Creamos el contexto vacío
export const AuthContext = createContext();

// Componente Proveedor: Envuelve a toda la aplicación
export const AuthContextProvider = ({ children }) => {
    
    // Leemos de LocalStorage de forma segura
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
    
    // Si hay token guardado, consideramos que está autenticado
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    // Función mágica que se llama al hacer Login exitoso
    const loginUser = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        // Persistencia (para que sobreviva al F5)
        localStorage.setItem('access_token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Función para cerrar sesión
    const logoutUser = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        // Limpiamos el rastro
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    };

    // Compartimos toda esta información y funciones con los hijos (el resto de la app)
    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
