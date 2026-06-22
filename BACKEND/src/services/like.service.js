import likeRepository from '../repositories/like.repository.js'
import postRepository from '../repositories/post.repository.js'
import { getIo } from '../config/socket.config.js'

class LikeService {
    // Patrón Toggle: Un solo botón gestiona la lógica de Dar/Quitar
    async toggleLike(postId, userId) {
        const post = await postRepository.getById(postId)
        if (!post) throw new Error('Post no encontrado')

        // 1. Buscamos si el usuario ya le había dado Like a este post
        const existingLike = await likeRepository.findLike(postId, userId)

        if (existingLike) {
            // Ya existía -> Lo quitamos (Unlike) y restamos 1 al contador
            await likeRepository.delete(existingLike._id)
            post.likesCount = Math.max(0, post.likesCount - 1)
            await post.save()
            return { message: 'Like removido', action: 'UNLIKE' }
        } else {
            // No existía -> Lo creamos (Like) y sumamos 1 al contador
            await likeRepository.create(postId, userId)
            post.likesCount += 1
            await post.save()

            // 🔥 EMISIÓN DE EVENTO WEBSOCKET: Alerta en Tiempo Real
            const io = getIo();
            // Solo enviamos notificación si el dueño del post no se está dando auto-like
            if (io && post.fk_id_user.toString() !== userId.toString()) {
                io.to(post.fk_id_user.toString()).emit('new_notification', {
                    type: 'LIKE',
                    message: '¡A alguien le gustó tu publicación!',
                    post_id: postId,
                    date: new Date()
                });
            }

            return { message: 'Like agregado', action: 'LIKE' }
        }
    }
}

export default new LikeService()
