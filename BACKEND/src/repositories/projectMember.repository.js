import ProjectMember from "../models/projectMembers.model.js"

class ProjectMemberRepository {

    // Busca una membresía específica cruzando el ID del usuario y el ID del project
    async getByUserAndProjectId(user_id, project_id) {
        const membership = await ProjectMember.findOne({
            fk_id_user: user_id,
            fk_id_project: project_id
        })
        return membership
    }

    async create(user_id, project_id, role) {
        return await ProjectMember.create({
            fk_id_project: project_id,
            fk_id_user: user_id,
            role: role,
        })
    }

    async getById(member_id) {
        return await ProjectMember.findById(member_id)
    }

    async updateById(member_id, update_data) {
        return await ProjectMember.findByIdAndUpdate(member_id, update_data)
    }

    async deleteById(member_id) {
        return await ProjectMember.findByIdAndDelete(member_id)
    }

    /* --- 2. TRAER MIEMBROS DE UN PROJECT --- */
    async getByProjectId(project_id) {
        const result = await ProjectMember
            .find({ fk_id_project: project_id })
            .populate('fk_id_user', 'name email') //POPULATE

        // Usamos la clase ayudante para limpiar cada resultado de la lista
        const members_mapped = result.map(
            (member) => new MemberProjectWithUserInfo(member)
        )
        return members_mapped
    }

    /* --- 3. TRAER PROJECTS DE UN USUARIO --- */
    async getByUserId(user_id) {
        const memberships = await ProjectMember
            .find({ fk_id_user: user_id })
            // Aquí rellenamos los datos del Project
            .populate({
                path: 'fk_id_project',
                select: 'name description status',
                match: { status: true }
            });

        return memberships
            // Filtramos los nulos (por si el project fue borrado)
            .filter(membership => membership.fk_id_project)
            // Transformamos (limpiamos) la data con una Arrow Function
            .map(membership => ({
                member_id: membership._id,
                member_role: membership.role,
                member_joined_at: membership.created_at,
                project_id: membership.fk_id_project._id,
                project_name: membership.fk_id_project.name,
                project_description: membership.fk_id_project.description
            }))
    }
}

const projectMemberRepository = new ProjectMemberRepository()
export default projectMemberRepository


/* CLASE AYUDANTE (Helper) */
class MemberProjectWithUserInfo {
    constructor(raw_member) {
        this.member_id = raw_member._id
        this.member_fk_id_project = raw_member.fk_id_project
        this.member_role = raw_member.role
        this.member_joined_at = raw_member.created_at

        // Gracias al populate, podemos acceder a las propiedades del usuario
        this.user_id = raw_member.fk_id_user._id
        this.user_name = raw_member.fk_id_user.name
        this.user_email = raw_member.fk_id_user.email
    }
}
