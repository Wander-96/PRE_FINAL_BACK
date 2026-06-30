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
            birth_date: user.birth_date,
            last_name: user.last_name,
            country: user.country,
            is_profile_complete: user.is_profile_complete,
            instruments: user.instruments,
            social_links: user.social_links,
            created_at: user.created_at
        }
    }

    // Actualizar perfil
    async updateProfile(userId, updateData) {
        const allowedUpdates = ['name', 'last_name', 'birth_date', 'country', 'avatar', 'bio', 'instruments', 'social_links', 'is_profile_complete']
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
