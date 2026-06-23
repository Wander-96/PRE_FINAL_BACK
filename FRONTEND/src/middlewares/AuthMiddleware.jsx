import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router';
import { AuthContext } from '../context/AuthContext';

const AuthMiddleware = () => {
    // Leemos el estado del cerebro global
    const { isAuthenticated } = useContext(AuthContext);
    
    // Si no está autenticado (no tiene token válido), lo pateamos al login
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    // Si SÍ está autenticado, dejamos que se renderice la ruta hija (el componente <Outlet />)
    // Ejemplo: Deja ver el <HomeScreen />
    return <Outlet />;
};

export default AuthMiddleware;
