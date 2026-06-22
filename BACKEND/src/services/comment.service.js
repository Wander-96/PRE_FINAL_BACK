import commentRepository from '../repositories/comment.repository.js'
import postRepository from '../repositories/post.repository.js'
import { getIo } from '../config/socket.config.js'

class CommentService {
    async createComment(commentData, userId) {
        // Validamos que el post exista antes de comentarlo
        const post = await postRepository.getById(commentData.fk_id_post)
        if (!post || post.status === 'DELETED') {
            throw new Error('El post no existe o fue eliminado')
        }

        commentData.fk_id_user = userId
        const newComment = await commentRepository.create(commentData)

        // Actualizamos el caché del post
        post.commentsCount += 1
        await post.save()

        // 🔥 EMISIÓN DE EVENTO WEBSOCKET: Alerta en Tiempo Real
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

        // Validación 1: Autoría
        if (comment.fk_id_user.toString() !== userId.toString()) {
            throw new Error('No tienes permisos para editar este comentario')
        }

        // Validación 2: Ventana de 15 minutos
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

        // Restamos 1 al caché del post
        if (post && post.commentsCount > 0) {
            post.commentsCount -= 1
            await post.save()
        }

        return deletedComment
    }
}

export default new CommentService()
