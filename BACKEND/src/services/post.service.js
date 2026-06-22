import postRepository from '../repositories/post.repository.js'

class PostService {
    async createPost(postData, userId) {
        // En el futuro aquí podríamos hacer web scraping para generar el link_preview
        postData.fk_id_user = userId
        return await postRepository.create(postData)
    }

    async getFeed(limit, page) {
        return await postRepository.getFeed(limit, page)
    }

    async updatePost(postId, updateData, userId) {
        const post = await postRepository.getById(postId)
        if (!post) throw new Error('Post no encontrado')

        // Validación 1: Solo el autor puede editar
        if (post.fk_id_user._id.toString() !== userId.toString()) {
            throw new Error('No tienes permisos para editar este post')
        }

        // Validación 2: Ventana de 15 minutos (900,000 milisegundos)
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

        // Aplicamos borrado lógico para no romper los reposts
        return await postRepository.softDelete(postId)
    }
}

export default new PostService()
