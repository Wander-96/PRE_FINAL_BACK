// src/routes/auth.router.js
import express from 'express'
import authController from '../controllers/auth.controller.js' // Traemos a nuestro Chef

// Creamos al Mesero (Router)
const authRouter = express.Router()

// Le decimos: "Cuando el cliente pida un POST a /register, llévaselo a la función register del Chef"
authRouter.post('/register', authController.register)

// Lo mismo para verificar email y login
authRouter.get('/verify-email', authController.verifyEmail)
authRouter.post('/login', authController.login)
authRouter.post('/reset-password-request', authController.resetPasswordRequest);
authRouter.put('/reset-password', authController.resetPasswordConfirm);

// Exportamos al mesero para que Servidor Principal (main.js) lo contrate
export default authRouter
