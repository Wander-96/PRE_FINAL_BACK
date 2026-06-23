import userRepository from '../repositories/user.repository.js'

class UserService {
    // Obtener perfil de usuario
    async getProfile(userId) {
        const user = await userRepository.getById(userId)
        if (!user) throw new Error('Usuario no encontrado')

        // Retorno de datos seguros
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            instruments: user.instruments,
            social_links: user.social_links,
            created_at: user.created_at
        }
    }

    // Actualizar perfil
    async updateProfile(userId, updateData) {
        const allowedUpdates = ['name', 'avatar', 'bio', 'instruments', 'social_links']
        const dataToUpdate = {}

        // Filtrado de campos permitidos
        Object.keys(updateData).forEach(key => {
            if (allowedUpdates.includes(key)) {
                dataToUpdate[key] = updateData[key]
            }
        })

        await userRepository.updateById(userId, dataToUpdate)
        
        // Retorno de perfil actualizado
        return await this.getProfile(userId)
    }
}

export default new UserService()
