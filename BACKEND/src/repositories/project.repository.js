import Project from "../models/project.model.js";

/* 
Crear el repository para manipular proyectos musicales en la Base de Datos
*/

class ProjectRepository {
    // - getAll() Obtiene toda la lista de proyectos musicales ACTIVOS.
    // (Recomendación: Usen find en vez de findOne, ya que quieren obtener una lista de resultados)

    async getAll() {
        return await Project.find({ status: true });
    }
    async getById(project_id) {
        return await Project.findById(project_id);
    }

    // - search(query) Buscador global de bandas
    async search(query, limit = 10, page = 1) {
        const skip = (page - 1) * limit
        return await Project.find({
            status: true,
            // Buscamos tanto en el nombre como en la descripción de la banda
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        })
        .skip(skip)
        .limit(limit)
    }


    // - softDeleteById(project_id) Oculta el espacio sin borrarlo
    async softDeleteById(project_id) {
        await this.updateById(project_id, { status: false });
    }

    // - deleteById(project_id) Eliminar un proyecto musical por su id y lo oculta en el retorno

    async deleteById(project_id) {
        return await Project.findByIdAndDelete(project_id, { status: false })
    }

    // - updateById(project_id, update_data) Permite actualizar un proyecto musical por su ID   

    async updateById(project_id, update_data) {
        return await Project.findByIdAndUpdate(project_id, update_data)
    }

    // - create(nombre, descripcion) Permite crear un proyecto musical en la DB 

    async create(name, description) {
        return await Project.create({
            name,
            description,
        });
    }
}



// Aplicamos Singleton: exportamos la instancia, no la clase

const projectRepository = new ProjectRepository();
export default projectRepository;