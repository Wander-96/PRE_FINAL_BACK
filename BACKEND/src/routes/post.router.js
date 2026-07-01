import express from 'express'
import postController from '../controllers/post.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import uploadMiddleware from '../middlewares/upload.middleware.js'

const postRouter = express.Router()

// Todas las rutas requieren autenticación
postRouter.use(authMiddleware)

// ==== RUTAS DE PUBLICACIONES (POSTS) ====

// Obtener publicaciones de un usuario específico
postRouter.get('/user/:userId', postController.getPostsByUser)

// Operaciones sobre posts específicos
postRouter.get('/:postId', postController.getPostById) // Traer un post
postRouter.put('/:postId', postController.updatePost) // Editar publicación (Regla 15 min)
postRouter.delete('/:postId', postController.deletePost) // Borrar publicación (Soft Delete)

// Permite subir hasta 10 archivos bajo el campo 'media'
postRouter.post('/', uploadMiddleware.array('media', 10), postController.createPost) // Crear publicación

// ==== RUTAS DE LIKES ====
postRouter.patch('/:postId/like', postController.toggleLike) // Dar o quitar Like (Toggle) con PATCH
postRouter.get('/:postId/like/status', postController.getLikeStatus) // Saber si ya dio like

export default postRouter
