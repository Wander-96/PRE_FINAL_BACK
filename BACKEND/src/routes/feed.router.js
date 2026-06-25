import express from 'express'
import postController from '../controllers/post.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const feedRouter = express.Router()

// Todas las rutas del feed requieren estar logueado
feedRouter.use(authMiddleware)

// Obtener el muro (Feed)
feedRouter.get('/', postController.getFeed) 

export default feedRouter
