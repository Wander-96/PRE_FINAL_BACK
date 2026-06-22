import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import uploadMiddleware from '../middlewares/upload.middleware.js';
import projectMiddleware from '../middlewares/project.middleware.js';
import projectController from '../controllers/project.controller.js';
import { MEMBER_PROJECT_ROLES } from '../constants/memberRoles.constant.js';
import memberProjectController from '../controllers/memberProject.controller.js';



const projectRouter = express.Router();

// =========================================================
// RUTAS PÚBLICAS (Acceso vía token en URL)
// =========================================================
projectRouter.get(
    '/:project_id/members/:decision',
    memberProjectController.processInvitation
);


// Estrategia de Autorización: Aplicamos el Guardia de Autenticación a TODAS las rutas de este archivo
projectRouter.use(authMiddleware);
// =========================================================
// RUTAS PROTEGIDAS (Requieren Autenticación Activa)
// =========================================================
projectRouter.post('/', projectController.create);
projectRouter.get('/', projectController.getAllByUser);
// =========================================================
// RUTAS DE ALTA SEGURIDAD (Requieren Roles Específicos)
// =========================================================
// Estrategia de Restricción: Middleware de autorización: Restringido a OWNER
projectRouter.delete(
    '/:project_id',
    projectMiddleware([MEMBER_PROJECT_ROLES.OWNER]),
    projectController.deleteById
)
// Middleware de autorización: Restringido a OWNER y ADMIN
projectRouter.put(
    '/:project_id',
    uploadMiddleware.single('cover_image'),
    projectMiddleware([MEMBER_PROJECT_ROLES.ADMIN, MEMBER_PROJECT_ROLES.OWNER]),
    projectController.updateById
)

// =========================================================
// RUTAS DE INVITACIONES
// =========================================================

// Ruta para ENVIAR una invitación (POST)
// Solo el OWNER y ADMIN del espacio pueden invitar a alguien
projectRouter.post(
    '/:project_id/members',
    projectMiddleware([MEMBER_PROJECT_ROLES.ADMIN, MEMBER_PROJECT_ROLES.OWNER]),
    memberProjectController.inviteUser
);

// Ruta para ACEPTAR o RECHAZAR una invitación (GET)
// Esta ruta no lleva el middleware de roles porque la abre el invitado desde su email
// Usamos :decision como variable dinámica que será 'ACEPTADO' o 'RECHAZADO'
projectRouter.get(
    '/:project_id/members/:decision',
    memberProjectController.processInvitation
);


export default projectRouter;