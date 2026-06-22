import Like from '../models/like.model.js'

class LikeRepository {
    async findLike(postId, userId) {
        return await Like.findOne({ fk_id_post: postId, fk_id_user: userId })
    }

    async create(postId, userId) {
        return await Like.create({ fk_id_post: postId, fk_id_user: userId })
    }

    async delete(likeId) {
        return await Like.findByIdAndDelete(likeId)
    }

    // Opcional: Por si en algún momento necesitamos reconstruir los contadores
    async countByPost(postId) {
        return await Like.countDocuments({ fk_id_post: postId })
    }
}

export default new LikeRepository()
