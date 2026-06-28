import likeRepository from '../repositories/like.repository.js'
import postRepository from '../repositories/post.repository.js'
import { getIo } from '../config/socket.config.js'
import notificationRepository from '../repositories/notification.repository.js'
class LikeService {
    // Gestión de estado de Like (Toggle)
    async toggleLike(postId, userId) {
        const post = await postRepository.getById(postId)
        if (!post) throw new Error('Post no encontrado')

        // Verificación de estado previo
        const existingLike = await likeRepository.findLike(postId, userId)

        if (existingLike) {
            // Acción: Remove Like
            await likeRepository.delete(existingLike._id)
            post.likesCount = Math.max(0, post.likesCount - 1)
            await post.save()
            return { message: 'Like removido', action: 'UNLIKE' }
        } else {
            // Acción: Add Like
            await likeRepository.create(postId, userId)
            post.likesCount += 1
            await post.save()

            // Emisión de Notificación WebSocket y Persistencia
            const io = getIo();
            if (post.fk_id_user.toString() !== userId.toString()) {
                // Guardar en base de datos
                await notificationRepository.create({
                    recipient: post.fk_id_user,
                    sender: userId,
                    type: 'LIKE',
                    related_entity: postId
                });

                if (io) {
                    io.to(post.fk_id_user.toString()).emit('new_notification', {
                        type: 'LIKE',
                        message: '¡A alguien le gustó tu publicación!',
                        post_id: postId,
                        date: new Date()
                    });
                }
            }

            return { message: 'Like agregado', action: 'LIKE' }
        }
    }
}

export default new LikeService()
