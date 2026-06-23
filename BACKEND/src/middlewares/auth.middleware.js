import { request } from "express";
import ENVIRONMENT from "../config/environment.config.js";
import ServerError from "../helpers/serverError.helper.js";
import jwt from 'jsonwebtoken';

/*
Middleware de autenticación mediante JWT.
Valida la presencia y autenticidad del token en los headers de la petición.
*/

function authMiddleware(request, response, next) {
    try {
        // Extracción de Header Authorization
        const authorization_header = request.headers.authorization
        if (!authorization_header) {
            throw new ServerError('No hay header de autorizacion', 401)
        }
        // Extracción de Token
        const authorization_token = authorization_header.split(' ')[1]
        if (!authorization_token) {
            throw new ServerError('No hay token de autorizacion', 401)
        }
        // Verificación de firma JWT
        const user_info = jwt.verify(
            authorization_token,
            ENVIRONMENT.JWT_SECRET
        )
        // Inyección de payload en Request
        request.user = user_info

        // Continuar flujo
        return next()
    }
    catch (error) {
        // Manejo de token inválido/expirado
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