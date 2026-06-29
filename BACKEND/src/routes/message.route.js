import { Router } from 'express';
import { getConversations, getMessages, createConversation } from '../controllers/message.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const messageRouter = Router();

// Todas las rutas de mensajes requieren autenticación
messageRouter.use(authMiddleware);

messageRouter.get('/conversations', getConversations);
messageRouter.post('/conversations', createConversation);
messageRouter.get('/:conversationId', getMessages);

export default messageRouter;
