import userRepository from '../repositories/user.repository.js'

class UserService {
    // Ver mi propio perfil o el de otro músico
    async getProfile(userId) {
        const user = await userRepository.getById(userId)
        if (!user) throw new Error('Usuario no encontrado')

        // Nunca devolvemos el password ni datos sensibles de seguridad
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

    // Editar perfil
    async updateProfile(userId, updateData) {
        const allowedUpdates = ['name', 'avatar', 'bio', 'instruments', 'social_links']
        const dataToUpdate = {}

        // Filtramos solo los campos permitidos (Evita que inyecten un cambio de password o de rol por aquí)
        Object.keys(updateData).forEach(key => {
            if (allowedUpdates.includes(key)) {
                dataToUpdate[key] = updateData[key]
            }
        })

        await userRepository.updateById(userId, dataToUpdate)
        
        // Retornamos el perfil limpio y actualizado
        return await this.getProfile(userId)
    }
}

export default new UserService()
