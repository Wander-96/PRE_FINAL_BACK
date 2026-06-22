import ProjectInvitation from "../models/projectInvitation.model.js";

class ProjectInvitationRepository {

    //CREAR INVITACIÓN
    async create(project_id, invited_by_id, email, role, expiration_date) {
        return await ProjectInvitation.create({
            fk_id_project: project_id,
            fk_id_invited_by: invited_by_id,
            email: email,
            role: role,
            expires_at: expiration_date
        })
    }

    //OBTENER POR ID
    async getById(invitation_id) {
        return await ProjectInvitation.findById(invitation_id)
    }

    //OBTENER INVITACIÓN POR PROJECT Y EMAIL
    async getByProjectAndEmail(project_id, email) {
        return await ProjectInvitation.findOne({
            fk_id_project: project_id,
            email: email
        })
    }

    //ACTUALIZAR ESTADO
    async updateById(invitation_id, update_data) {
        return await ProjectInvitation.findByIdAndUpdate(invitation_id, update_data, { new: true })
    }

    //ELIMINAR INVITACIÓN 
    async deleteById(invitation_id) {
        return await ProjectInvitation.findByIdAndDelete(invitation_id)
    }
}

const projectInvitationRepository = new ProjectInvitationRepository();
export default projectInvitationRepository;
