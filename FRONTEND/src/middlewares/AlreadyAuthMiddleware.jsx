import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router';
import { AuthContext } from '../context/AuthContext';

const AlreadyAuthMiddleware = () => {
    // Leemos el estado del cerebro global
    const { isAuthenticated } = useContext(AuthContext);
    
    // Si YA ESTÁ autenticado, no tiene sentido que vea la pantalla de Login ni la de Registro.
    // Lo redirigimos automáticamente a su muro (home)
    if (isAuthenticated) {
        return <Navigate to="/home" />;
    }
    
    // Si NO está autenticado, lo dejamos ver la ruta hija (el componente <Outlet />)
    // Ejemplo: Deja ver el <LoginScreen /> o <RegisterScreen />
    return <Outlet />;
};

export default AlreadyAuthMiddleware;
