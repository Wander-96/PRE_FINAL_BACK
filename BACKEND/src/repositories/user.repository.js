// Importamos el Modelo, ya que el Repositorio ES el único autorizado a usarlo
import User from "../models/user.model.js";


class UserRepository {
    // Busca todos los usuarios, pero fíjate: ¡solo los que estén activos!
    async getAll() {
        return await User.find({ is_active: true })
    }
    // Encuentra un usuario específico por su ID único
    async getById(user_id) {
        return await User.findById(user_id)
    }

    // Buscador global de usuarios
    async search(query, limit = 10, page = 1) {
        const skip = (page - 1) * limit
        return await User.find({
            is_active: true,
            name: { $regex: query, $options: 'i' } // 'i' significa case-insensitive
        })
        .select('name avatar bio instruments') // Por seguridad, nunca devolver emails o passwords en una búsqueda pública
        .skip(skip)
        .limit(limit)
    }

    // Crea un nuevo registro en la base de datos
    async create(name, email, password) {
        return await User.create({
            name,
            email,
            password
        })
    }

    async getByEmail(email) {
        // Buscar en la DB un usuario cuyo email sea el indicado y que esté activo  
        const user_found = await User.findOne({ email: email, is_active: true })
        return user_found
    }

    async deleteById(user_id) {
        /* 
       SOFT DELETE (Borrado lógico): 
       En sistemas reales, rara vez borramos registros. Simplemente los ocultamos.
       */
        await User.findByIdAndUpdate(user_id, { is_active: false })

        /* HARD DELETE (Borrado físico): Elimina el registro por completo 

        await User.findByIdAndDelete(user_id)
        */
    }

    async updateById(user_id, update_data) {
        await User.findByIdAndUpdate(user_id, update_data)
    }

}
// OJO AQUÍ: Aplicamos el "Patrón Singleton". 
// En lugar de exportar la Clase, exportamos UNA SOLA instancia de la clase ya creada.
// Así, toda la app usará exactamente el mismo objeto de repositorio, ahorrando memoria.

const userRepository = new UserRepository()

export default userRepository