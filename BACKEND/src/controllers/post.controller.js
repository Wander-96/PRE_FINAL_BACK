import postService from '../services/post.service.js'
import likeService from '../services/like.service.js'
import commentService from '../services/comment.service.js'

class PostController {
    // ---- POSTS ----
    async createPost(req, res) {
        try {
            const userId = req.user.id 
            const postData = { ...req.body }

            // Procesar las imágenes si existen (req.files es un array por ser upload.array)
            if (req.files && req.files.length > 0) {
                postData.media = req.files.map(file => ({
                    url: file.path,
                    type: 'IMAGE' // Cloudinary asigna la url pública aquí
                }))
            }

            const newPost = await postService.createPost(postData, userId)
            res.status(201).json({ ok: true, message: 'Publicación creada con éxito', data: newPost })
        } catch (error) {
            res.status(400).json({ ok: false, message: error.message })
        }
    }

    async getFeed(req, res) {
        try {
            // Extraemos los query params de la URL: /api/posts?limit=10&page=1
            const limit = parseInt(req.query.limit) || 10
            const page = parseInt(req.query.page) || 1
            const posts = await postService.getFeed(limit, page)
            res.status(200).json({ ok: true, data: posts })
        } catch (error) {
            res.status(400).json({ ok: false, message: error.message })
        }
    }

    async updatePost(req, res) {
        try {
            const { postId } = req.params
            const userId = req.user.id
            const updatedPost = await postService.updatePost(postId, req.body, userId)
            res.status(200).json({ ok: true, message: 'Post actualizado', data: updatedPost })
        } catch (error) {
            // Si pasaron los 15 minutos, el error caerá directamente aquí
            res.status(403).json({ ok: false, message: error.message })
        }
    }

    async deletePost(req, res) {
        try {
            const { postId } = req.params
            const userId = req.user.id
            await postService.deletePost(postId, userId)
            res.status(200).json({ ok: true, message: 'Post eliminado exitosamente' })
        } catch (error) {
            res.status(403).json({ ok: false, message: error.message })
        }
    }

    // ---- LIKES ----
    async toggleLike(req, res) {
        try {
            const { postId } = req.params
            const userId = req.user.id
            const result = await likeService.toggleLike(postId, userId)
            res.status(200).json({ ok: true, message: result.message, action: result.action })
        } catch (error) {
            res.status(400).json({ ok: false, message: error.message })
        }
    }

    // ---- COMENTARIOS ----
    async createComment(req, res) {
        try {
            // El usuario envía: { contenido: "Buen tema!" } a la ruta /api/posts/:postId/comments
            const commentData = { ...req.body, fk_id_post: req.params.postId }
            const userId = req.user.id
            const newComment = await commentService.createComment(commentData, userId)
            res.status(201).json({ ok: true, message: 'Comentario agregado', data: newComment })
        } catch (error) {
            res.status(400).json({ ok: false, message: error.message })
        }
    }

    async getCommentsByPost(req, res) {
        try {
            const { postId } = req.params
            const limit = parseInt(req.query.limit) || 10
            const page = parseInt(req.query.page) || 1
            const comments = await commentService.getByPost(postId, limit, page)
            res.status(200).json({ ok: true, data: comments })
        } catch (error) {
            res.status(400).json({ ok: false, message: error.message })
        }
    }

    async updateComment(req, res) {
        try {
            const { commentId } = req.params
            const userId = req.user.id
            const updatedComment = await commentService.updateComment(commentId, req.body, userId)
            res.status(200).json({ ok: true, message: 'Comentario editado', data: updatedComment })
        } catch (error) {
            res.status(403).json({ ok: false, message: error.message })
        }
    }

    async deleteComment(req, res) {
        try {
            const { commentId } = req.params
            const userId = req.user.id
            await commentService.deleteComment(commentId, userId)
            res.status(200).json({ ok: true, message: 'Comentario borrado' })
        } catch (error) {
            res.status(403).json({ ok: false, message: error.message })
        }
    }
}

export default new PostController()
