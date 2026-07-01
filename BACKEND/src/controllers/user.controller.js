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
            
            // Procesamiento de imágenes (ahora usamos req.files por uploadMiddleware.fields)
            const updateData = { ...req.body };
            
            if (req.files) {
                if (req.files.avatar && req.files.avatar[0]) {
                    updateData.avatar = req.files.avatar[0].path; // URL de Cloudinary
                }
                if (req.files.cover_photo && req.files.cover_photo[0]) {
                    updateData.cover_photo = req.files.cover_photo[0].path; // URL de Cloudinary
                }
            } else if (req.file) { // Por retrocompatibilidad por si acaso
                updateData.avatar = req.file.path;
            }

            // Parsear social_links si viene como string desde FormData
            if (updateData.social_links && typeof updateData.social_links === 'string') {
                try {
                    updateData.social_links = JSON.parse(updateData.social_links);
                } catch (e) {
                    console.error("Error parseando social_links", e);
                }
            }

            // Lógica de perfil completo: si estamos actualizando desde la pantalla de setup, 
            // marcamos el perfil como completo. Podemos simplemente setearlo si manda last_name y country.
            if (updateData.last_name || updateData.country) {
                updateData.is_profile_complete = true;
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
