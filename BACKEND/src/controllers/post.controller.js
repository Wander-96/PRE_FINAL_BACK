import postService from '../services/post.service.js'
import likeService from '../services/like.service.js'
class PostController {
    // ---- POSTS ----
    async createPost(req, res) {
        try {
            const userId = req.user.id 
            const postData = { ...req.body }

            // Procesamiento de archivos multimedia
            if (req.files && req.files.length > 0) {
                postData.media = req.files.map(file => {
                    // Cloudinary nos da la URL. Podemos inferir si es video si es mp4/webm, o si su mimetype es video.
                    const isVideo = file.mimetype && file.mimetype.startsWith('video');
                    return {
                        url: file.path,
                        type: isVideo ? 'VIDEO' : 'IMAGE'
                    };
                });
            }

            const newPost = await postService.createPost(postData, userId)
            res.status(201).json({ ok: true, message: 'Publicación creada con éxito', data: newPost })
        } catch (error) {
            res.status(400).json({ ok: false, message: error.message })
        }
    }

    async getFeed(req, res) {
        try {
            // Extracción de parámetros de paginación
            const limit = parseInt(req.query.limit) || 10
            const page = parseInt(req.query.page) || 1
            const posts = await postService.getFeed(limit, page)
            res.status(200).json({ ok: true, data: posts })
        } catch (error) {
            res.status(400).json({ ok: false, message: error.message })
        }
    }

    async getPostById(req, res) {
        try {
            const { postId } = req.params
            const post = await postService.getPostById(postId)
            res.status(200).json({ ok: true, data: post })
        } catch (error) {
            res.status(404).json({ ok: false, message: error.message })
        }
    }

    async getPostsByUser(req, res) {
        try {
            const { userId } = req.params
            const limit = parseInt(req.query.limit) || 10
            const page = parseInt(req.query.page) || 1
            const posts = await postService.getPostsByUser(userId, limit, page)
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
            // Manejo de error de validación
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
}

export default new PostController()
