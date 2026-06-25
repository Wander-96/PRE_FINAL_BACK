import postRepository from '../repositories/post.repository.js'

class PostService {
    async createPost(postData, userId) {
        // Funcionalidad futura: Web scraping para link_preview
        postData.fk_id_user = userId
        return await postRepository.create(postData)
    }

    async getFeed(limit, page) {
        return await postRepository.getFeed(limit, page)
    }

    async getPostById(postId) {
        const post = await postRepository.getById(postId)
        if (!post) throw new Error('Post no encontrado')
        return post
    }

    async getPostsByUser(userId, limit, page) {
        return await postRepository.getByUserId(userId, limit, page)
    }

    async updatePost(postId, updateData, userId) {
        const post = await postRepository.getById(postId)
        if (!post) throw new Error('Post no encontrado')

        // Validación de Autoría
        if (post.fk_id_user._id.toString() !== userId.toString()) {
            throw new Error('No tienes permisos para editar este post')
        }

        // Validación de ventana de edición (15 min)
        const timeElapsed = Date.now() - new Date(post.createdAt).getTime()
        if (timeElapsed > 900000) {
            throw new Error('El tiempo límite para editar este post ha expirado (15 minutos)')
        }

        return await postRepository.update(postId, updateData)
    }

    async deletePost(postId, userId) {
        const post = await postRepository.getById(postId)
        if (!post) throw new Error('Post no encontrado')

        if (post.fk_id_user._id.toString() !== userId.toString()) {
            throw new Error('No tienes permisos para eliminar este post')
        }

        // Soft Delete
        return await postRepository.softDelete(postId)
    }
}

export default new PostService()
