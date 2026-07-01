import { Router } from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import uploadMiddleware from "../middlewares/upload.middleware.js";

const userRouter = Router();

// Seguridad: Nadie puede ver ni editar perfiles si no tiene un access_token válido
userRouter.use(authMiddleware);

// GET /api/users/me (Mi perfil) 
// IMPORTANTE: Esta ruta debe ir ANTES de /:userId para que Express no confunda la palabra 'me' con un ID de Mongo.
userRouter.get('/me', userController.getMyProfile);

// PUT /api/users/me (Editar mi perfil)
// Usamos uploadMiddleware.fields para aceptar avatar y cover_photo
userRouter.put('/me', uploadMiddleware.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover_photo', maxCount: 1 }]), userController.updateMyProfile);

// GET /api/users/:userId (Perfil público de otro usuario)
userRouter.get('/:userId', userController.getUserProfile);

export default userRouter;
