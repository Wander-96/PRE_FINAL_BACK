import express from 'express'
import postController from '../controllers/post.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import uploadMiddleware from '../middlewares/upload.middleware.js'

const postRouter = express.Router()

// IMPORTANTE: Todas las rutas del muro requieren estar logueado (Tener un Token JWT válido)
postRouter.use(authMiddleware)

// ==== RUTAS DE PUBLICACIONES (POSTS) ====
postRouter.get('/', postController.getFeed) // Obtener el muro
// Permite subir hasta 10 archivos bajo el campo 'media'
postRouter.post('/', uploadMiddleware.array('media', 10), postController.createPost) // Crear publicación
postRouter.put('/:postId', postController.updatePost) // Editar publicación (Regla 15 min)
postRouter.delete('/:postId', postController.deletePost) // Borrar publicación (Soft Delete)

// ==== RUTAS DE LIKES ====
postRouter.post('/:postId/like', postController.toggleLike) // Dar o quitar Like (Toggle)

// ==== RUTAS DE COMENTARIOS ====
postRouter.get('/:postId/comments', postController.getCommentsByPost) // Ver comentarios
postRouter.post('/:postId/comments', postController.createComment) // Comentar un post

// Nota: Para editar/borrar comentarios, la URL no necesita el ID del post, solo el del comentario
postRouter.put('/comments/:commentId', postController.updateComment) 
postRouter.delete('/comments/:commentId', postController.deleteComment)

export default postRouter
