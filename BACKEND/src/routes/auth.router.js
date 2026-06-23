
import express from 'express'
import authController from '../controllers/auth.controller.js'

// Inicialización de Router
const authRouter = express.Router()

// Rutas de Registro
authRouter.post('/register', authController.register)

// Rutas de Acceso y Verificación
authRouter.get('/verify-email', authController.verifyEmail)
authRouter.post('/login', authController.login)
authRouter.post('/reset-password-request', authController.resetPasswordRequest);
authRouter.put('/reset-password', authController.resetPasswordConfirm);

// Exportación de Módulo
export default authRouter
