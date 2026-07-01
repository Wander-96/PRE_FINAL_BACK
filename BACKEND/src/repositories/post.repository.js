import Post from '../models/post.model.js'

class PostRepository {
    async create(postData) {
        return await Post.create(postData)
    }

    // Paginación tradicional (Offset): Ideal para empezar
    async getFeed(limit = 10, page = 1) {
        const skip = (page - 1) * limit
        return await Post.find({ status: 'ACTIVE' })
            .sort({ createdAt: -1 }) // Los más nuevos primero
            .skip(skip)
            .limit(limit)
            .populate('fk_id_user', 'name apellido avatar') // Trae los datos básicos del autor
            .populate({
                path: 'fk_id_reposted_post',
                populate: { path: 'fk_id_user', select: 'name apellido avatar' }
            }) // Si es un repost, trae el post original y su autor
    }

    async getById(postId) {
        return await Post.findById(postId).populate('fk_id_user', 'name apellido avatar')
    }

    async getByUserId(userId, limit = 10, page = 1) {
        const skip = (page - 1) * limit
        return await Post.find({ fk_id_user: userId, status: 'ACTIVE' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('fk_id_user', 'name apellido avatar')
            .populate({
                path: 'fk_id_reposted_post',
                populate: { path: 'fk_id_user', select: 'name apellido avatar' }
            })
    }

    async update(postId, updateData) {
        return await Post.findByIdAndUpdate(postId, updateData, { new: true })
    }

    // Soft Delete (Ocultamos el post, pero no rompemos la base de datos)
    async softDelete(postId) {
        return await Post.findByIdAndUpdate(postId, { status: 'DELETED' }, { new: true })
    }
    // Búsqueda global de publicaciones por contenido
    async search(query, limit = 10, page = 1) {
        const skip = (page - 1) * limit
        return await Post.find({
            status: 'ACTIVE',
            content: { $regex: query, $options: 'i' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('fk_id_user', 'name apellido avatar')
        .populate({
            path: 'fk_id_reposted_post',
            populate: { path: 'fk_id_user', select: 'name apellido avatar' }
        })
    }
}

export default new PostRepository()
