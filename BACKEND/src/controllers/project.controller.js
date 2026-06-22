import { request, response } from "express";
import { MEMBER_PROJECT_ROLES } from "../constants/memberRoles.constant.js"
import ServerError from "../helpers/serverError.helper.js"
import projectRepository from "../repositories/project.repository.js";
import projectrepository from "../repositories/project.repository.js"
import projectMemberRepository from "../repositories/projectMember.repository.js"

class ProjectController {

    //1. CREAR UN proyecto musical

    async create(request, response) {
        try {
            const { name, description } = request.body;

            //MIDDLEWARE: ID de usuario validado e inyectado por el middleware
            const user_id = request.user.id;

            //Validacion de negocio
            if (!name || name.trim() === '') {
                throw new ServerError("El nombre del proyecto musical es obligatorio", 400);
            }

            //1. Le pedimos al repositorio crear el espacio
            const newProject = await projectRepository.create(
                name,
                description || ""
            );

            //2. Le pedimos al repositorio de membresias que nos de la llave como dueños
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
    //2. OBTENER MIS proyectos musicales
    async getAllByUser(request, response) {
        try {
            const user_id = request.user.id;

            // Le pedimos al Repositorio que busque todas mis membresías
            // Gracias al '.populate()',esto no solo trae la membresía, sino todos los datos del Project
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

    //3. ELIMINAR ESPACIO DE TRAJO (ADMIN)
    async deleteById(request, response) {
        try {
            const project_id = request.params.project_id

            //soft delete (solo oculta)
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

    // ACTUALIZAR proyecto musical 
    async updateById(request, response) {
        try {
            const project_id = request.params.project_id
            const { name, description } = request.body

            //Objeto vacio donde guardamos solo lo que el usuario envio
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
            
            // Si el usuario subió una imagen de portada, guardamos la URL oficial de Cloudinary
            if (request.file) {
                updated_info.cover_image = request.file.path;
            }

            //Pasamos el objeto solo con los campos que se actualizaron
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

