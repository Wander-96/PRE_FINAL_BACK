import express from 'express';
import connectionController from '../controllers/connection.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const connectionRouter = express.Router();

// Todas las rutas de conexión requieren estar autenticado
connectionRouter.use(authMiddleware);

// Rutas de solicitudes
connectionRouter.post('/request/:recipientId', connectionController.sendRequest);
connectionRouter.put('/accept/:connectionId', connectionController.acceptRequest);
connectionRouter.delete('/:connectionId', connectionController.removeConnection);

// Rutas de consultas
connectionRouter.get('/pending', connectionController.getPendingRequests);
connectionRouter.get('/user/:userId', connectionController.getConnections);
connectionRouter.get('/status/:targetUserId', connectionController.getConnectionStatus);

export default connectionRouter;
