import { request } from "express";
import ENVIRONMENT from "../config/environment.config.js";
import ServerError from "../helpers/serverError.helper.js";
import jwt from 'jsonwebtoken';

/*
Un Middleware siempre recibe 3 cosas:
1. request (la petición del usuario)
2. response (para enviarle un error si lo bloqueamos)
3. next (el botón mágico que abre la puerta para que pase al Controlador)
*/

function authMiddleware(request, response, next) {
    try {
        // 1. Buscamos el gafete en los "headers" (cabeceras ocultas de la petición)
        const authorization_header = request.headers.authorization
        if (!authorization_header) {
            throw new ServerError('No hay header de autorizacion', 401)
        }
        // 2. El header suele venir así: "Bearer eyJhbGciOi..." 
        // Lo cortamos por el espacio (' ') y nos quedamos con la segunda parte [1]    
        const authorization_token = authorization_header.split(' ')[1]
        if (!authorization_token) {
            throw new ServerError('No hay token de autorizacion', 401)
        }
        // 3. Verificamos que el gafete sea genuino (no esté expirado o falsificado)
        // Al verificarlo, se nos devuelve la info del usuario (nombre, email, id)    
        const user_info = jwt.verify(
            authorization_token,
            ENVIRONMENT.JWT_SECRET
        )
        // 4. ¡EL estrategia MÁS IMPORTANTE!
        // Pegamos la información del usuario directamente en la "comanda" (request).
        // Así, cuando la petición llegue al Chef (Controlador), el Chef sabrá 
        // exactamente QUIÉN está haciendo el pedido sin tener que volver a buscarlo.  
        request.user = user_info

        //Activamos la funcion next() par abrirle la puerta al usuario
        return next()
    }
    catch (error) {
        // Si el token es inválido, lo bloqueamos en la puerta (401)
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return response.status(401).json({
                message: 'Token expirado o invalido',
                ok: false,
                status: 401
            })
        }
        else if (error instanceof ServerError) {
            return response.status(error.status).json({
                message: error.message,
                ok: false,
                status: error.status
            })
        }
        else {
            console.error('Error critico:', error);
            return response.status(500).json({
                message: "Error interno del servidor",
                ok: false,
                status: 500
            });
        }
    }
}

export default authMiddleware;