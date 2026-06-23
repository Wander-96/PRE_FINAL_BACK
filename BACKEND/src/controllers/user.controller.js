import userService from '../services/user.service.js'

class UserController {
    // Obtener perfil propio
    async getMyProfile(req, res) {
        try {
            const userId = req.user.id; // Extraído del token por el middleware
            const profile = await userService.getProfile(userId);
            return res.status(200).json({ ok: true, data: profile });
        } catch (error) {
            return res.status(404).json({ ok: false, message: error.message });
        }
    }

    // Obtener perfil de tercero
    async getUserProfile(req, res) {
        try {
            const { userId } = req.params;
            const profile = await userService.getProfile(userId);
            return res.status(200).json({ ok: true, data: profile });
        } catch (error) {
            return res.status(404).json({ ok: false, message: error.message });
        }
    }

    // Actualizar perfil propio
    async updateMyProfile(req, res) {
        try {
            const userId = req.user.id; 
            
            // Procesamiento de avatar
            const updateData = { ...req.body };
            if (req.file) {
                updateData.avatar = req.file.path; // Aquí guardamos la URL oficial de la nube
            }

            const updatedProfile = await userService.updateProfile(userId, updateData);
            return res.status(200).json({ 
                ok: true, 
                message: "Perfil actualizado exitosamente",
                data: updatedProfile 
            });
        } catch (error) {
            return res.status(400).json({ ok: false, message: error.message });
        }
    }
}

export default new UserController()
