import express from 'express';
import notificationController from '../controllers/notification.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const notificationRouter = express.Router();

// Obtener mis notificaciones
notificationRouter.get('/', authMiddleware, notificationController.getMyNotifications);

// Marcar todas como leídas
notificationRouter.put('/read', authMiddleware, notificationController.markAllAsRead);

export default notificationRouter;
