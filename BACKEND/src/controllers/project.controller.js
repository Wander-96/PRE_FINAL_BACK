import { request, response } from "express";
import { MEMBER_PROJECT_ROLES } from "../constants/memberRoles.constant.js"
import ServerError from "../helpers/serverError.helper.js"
import projectRepository from "../repositories/project.repository.js";
import projectrepository from "../repositories/project.repository.js"
import projectMemberRepository from "../repositories/projectMember.repository.js"

class ProjectController {

    // Creación de proyecto

    async create(request, response) {
        try {
            const { name, description } = request.body;

            // Extracción de ID validado
            const user_id = request.user.id;

            // Validación de negocio
            if (!name || name.trim() === '') {
                throw new ServerError("El nombre del proyecto musical es obligatorio", 400);
            }

            // Creación en repositorio
            const newProject = await projectRepository.create(
                name,
                description || ""
            );

            // Asignación de rol OWNER
            await projectMemberRepository.create(
                user_id,
                newProject._id,
                MEMBER_PROJECT_ROLES.OWNER
            );

            return response.status(201).json({
                ok: true,
                message: "proyecto musical creado con exito",
                data: {
                    project: newProject
                }
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: "Error interno del servidor"
                });
            }
        }
    }
    // Obtener proyectos del usuario
    async getAllByUser(request, response) {
        try {
            const user_id = request.user.id;

            // Búsqueda de membresías pobladas
            const projects = await projectMemberRepository.getByUserId(user_id);

            return response.status(200).json({
                ok: true,
                message: "proyectos musicales obtenidos",
                data: {
                    projects
                }
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(500).json({ ok: false, message: "Error interno" });
            }
            console.error(error);
        }
    }

    // Eliminar proyecto (Admin)
    async deleteById(request, response) {
        try {
            const project_id = request.params.project_id

            // Soft Delete
            const deleted_project = await projectRepository.softDeleteById(project_id)

            return response.status(200).json({
                message: "proyecto musical eliminado correctamente",
                ok: true,
                status: 200,
                data: {
                    project: deleted_project
                }
            });

        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    message: error.message,
                    ok: false,
                    status: error.status
                })
            } else {
                console.error("Error critico: ", error);
                return response.status(500).json({
                    message: "Error interno del servidor",
                    ok: false,
                    status: 500
                });
            }
        }
    }

    // Actualizar proyecto
    async updateById(request, response) {
        try {
            const project_id = request.params.project_id
            const { name, description } = request.body

            // Objeto de actualización parcial
            const updated_info = {}

            if (!name && !description) {
                throw new ServerError("Debes enviar al menos un campo para actualizar", 400)
            }

            if (name) {
                if (name.length < 2) {
                    throw new ServerError("El nombre debe tener al menos 2 caracteres", 400)
                }
                updated_info.name = name
            }
            if (description) {
                updated_info.description = description
            }
            
            // Procesamiento de imagen de portada
            if (request.file) {
                updated_info.cover_image = request.file.path;
            }

            // Actualización en repositorio
            await projectRepository.updateById(project_id, updated_info)
            const project_after_update = await projectRepository.getById(project_id)

            return response.status(200).json({
                message: "proyecto musical actualizado exitosamente",
                ok: true,
                status: 200,
                data: {
                    project: project_after_update
                }
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    message: error.message,
                    ok: false,
                    status: error.status
                })
            } else {
                console.error('Error critico: ', error);
                return response.status(500).json({
                    message: "Error interno del servidor",
                    ok: false,
                    status: 500
                });
            }
        }
    }

}

const projectController = new ProjectController();
export default projectController;

