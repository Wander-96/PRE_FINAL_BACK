import express from 'express'
import commentController from '../controllers/comment.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const commentRouter = express.Router()

// Todas las rutas de comentarios requieren autenticación
commentRouter.use(authMiddleware)

// Obtener comentarios de un post
commentRouter.get('/post/:postId', commentController.getCommentsByPost) 

// Comentar un post
commentRouter.post('/post/:postId', commentController.createComment) 

// Editar y borrar un comentario (solo necesitan su propio ID)
commentRouter.put('/:commentId', commentController.updateComment) 
commentRouter.delete('/:commentId', commentController.deleteComment)

export default commentRouter
