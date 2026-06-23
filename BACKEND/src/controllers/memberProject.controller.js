import ServerError from "../helpers/serverError.helper.js";
import memberProjectService from "../services/memberProject.service.js";

class MemberProjectController {

    async inviteUser(request, response) {
        try {
            const { project_id } = request.params;
            const { invited_email, role } = request.body;
            const user_invited_by_id = request.user.id;

            if (!invited_email || !role) {
                throw new ServerError("Faltan datos obligatorios (email y rol)", 400);
            }

            await memberProjectService.inviteUser(
                user_invited_by_id,
                invited_email,
                project_id,
                role
            );

            return response.status(200).json({
                ok: true,
                message: "Invitacion enviada con exito"
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({ ok: false, message: error.message });
            }
            console.error("Error en inviteUser: ", error);
            return response.status(500).json({ ok: false, message: "Error interno del servidor" })
        }
    }

    async processInvitation(request, response) {
        try {
            const { decision } = request.params;
            const { token } = request.query;

            if (!token) throw new ServerError("Falta token de invitacion", 400);
            if (decision !== 'ACEPTADO' && decision !== 'RECHAZADO') {
                throw new ServerError("Decision no valida", 400);
            }

            // Llamada a servicio
            await memberProjectService.processInvitation(token, decision);

            return response.status(200).json({
                ok: true,
                message: `La invitación ha sido marcada como ${decision} con éxito.`
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return response.status(400).json({
                    ok: false,
                    message: "El enlace de invitacion ha caducado"
                });
            }
            console.error("Error en processInvitation: ", error);
            return response.status(500).json({
                ok: false,
                message: "Error interno del servidor"
            });
        }
    }
}

const memberProjectController = new MemberProjectController();
export default memberProjectController;