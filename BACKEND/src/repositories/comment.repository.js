import Comment from '../models/comment.model.js'

class CommentRepository {
    async create(commentData) {
        return await Comment.create(commentData)
    }

    // Paginación para comentarios: Si un post tiene 2000 comentarios, no los cargamos todos.
    async getByPost(postId, limit = 10, page = 1) {
        const skip = (page - 1) * limit
        return await Comment.find({ fk_id_post: postId, status: 'ACTIVE' })
            .sort({ createdAt: 1 }) // Los comentarios más antiguos primero (como en YouTube)
            .skip(skip)
            .limit(limit)
            .populate('fk_id_user', 'name apellido avatar')
    }

    async getById(commentId) {
        return await Comment.findById(commentId)
    }

    async update(commentId, updateData) {
        return await Comment.findByIdAndUpdate(commentId, updateData, { new: true })
    }

    async softDelete(commentId) {
        return await Comment.findByIdAndUpdate(commentId, { status: 'DELETED' }, { new: true })
    }
}

export default new CommentRepository()
