import commentService from '../services/comment.service.js'

class CommentController {
    async createComment(req, res) {
        try {
            // Armado de payload
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

export default new CommentController()
