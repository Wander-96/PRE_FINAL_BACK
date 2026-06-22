import ServerError from "../helpers/serverError.helper.js"
import projectRepository from "../repositories/project.repository.js"
import projectMemberRepository from "../repositories/projectMember.repository.js"

function projectMiddleware(valid_roles = []) {
    5

    return async function (request, response, next) {
        try {
            const user_id = request.user.id
            const project_id = request.params.project_id

            if (!project_id) {
                throw new ServerError("No se proporciono el ID del proyecto musical", 400)
            }

            const project = await projectRepository.getById(project_id)
            if (!project) {
                throw new ServerError("No se encontro el proyecto musical", 404)
            }
            // Buscamos si existe la relación entre este usuario y este project
            const member_selected = await projectMemberRepository.getByUserAndProjectId(user_id, project_id)
            if (!member_selected) {
                throw new ServerError("No eres miembro de este proyecto musical", 403)
            }
            // Verificamos si el rol del usuario esta dentro de la lista de roles permitidos.
            if (valid_roles.length > 0 && !valid_roles.includes(member_selected.rol)) {
                throw new ServerError("No tienes el rol necesario para esta accion", 403)
            }

            //Pegamos los datos en la "comanda" (resquest) para que el controlador los tenga a mano
            request.project = project
            request.membership = member_selected

            return next()

        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    message: error.message,
                    ok: false,
                    status: error.status
                });
            } else {
                return response.status(500).json({
                    message: "Error interno real",
                    ok: false,
                    status: 500
                });
            }
        }
    }
}

export default projectMiddleware;