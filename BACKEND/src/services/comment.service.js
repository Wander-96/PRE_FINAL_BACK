import commentRepository from '../repositories/comment.repository.js'
import postRepository from '../repositories/post.repository.js'
import { getIo } from '../config/socket.config.js'

class CommentService {
    async createComment(commentData, userId) {
        // Validación de existencia del post
        const post = await postRepository.getById(commentData.fk_id_post)
        if (!post || post.status === 'DELETED') {
            throw new Error('El post no existe o fue eliminado')
        }

        commentData.fk_id_user = userId
        const newComment = await commentRepository.create(commentData)

        // Actualización de caché de contador
        post.commentsCount += 1
        await post.save()

        // Emisión de Notificación WebSocket
        const io = getIo();
        if (io && post.fk_id_user.toString() !== userId.toString()) {
            io.to(post.fk_id_user.toString()).emit('new_notification', {
                type: 'COMMENT',
                message: '¡Alguien ha comentado tu publicación!',
                post_id: post._id,
                date: new Date()
            });
        }

        return newComment
    }

    async getByPost(postId, limit, page) {
        return await commentRepository.getByPost(postId, limit, page)
    }

    async updateComment(commentId, updateData, userId) {
        const comment = await commentRepository.getById(commentId)
        if (!comment) throw new Error('Comentario no encontrado')

        // Validación de Autoría
        if (comment.fk_id_user.toString() !== userId.toString()) {
            throw new Error('No tienes permisos para editar este comentario')
        }

        // Validación de ventana de edición (15 min)
        const timeElapsed = Date.now() - new Date(comment.createdAt).getTime()
        if (timeElapsed > 900000) {
            throw new Error('El tiempo límite para editar este comentario ha expirado (15 minutos)')
        }

        return await commentRepository.update(commentId, updateData)
    }

    async deleteComment(commentId, userId) {
        const comment = await commentRepository.getById(commentId)
        if (!comment) throw new Error('Comentario no encontrado')

        // Autoría
        if (comment.fk_id_user.toString() !== userId.toString()) {
            throw new Error('No tienes permisos para eliminar este comentario')
        }

        const post = await postRepository.getById(comment.fk_id_post)

        const deletedComment = await commentRepository.softDelete(commentId)

        // Decremento de caché de contador
        if (post && post.commentsCount > 0) {
            post.commentsCount -= 1
            await post.save()
        }

        return deletedComment
    }
}

export default new CommentService()
