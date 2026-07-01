import userRepository from '../repositories/user.repository.js';
import projectRepository from '../repositories/project.repository.js';
import postRepository from '../repositories/post.repository.js';

class SearchController {
    async globalSearch(req, res) {
        try {
            const query = req.query.q || '';
            const type = req.query.type || 'all'; // 'all', 'users', 'projects'
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;

            // Validación de longitud mínima
            if (query.length === 1) {
                return res.status(400).json({ ok: false, message: 'La búsqueda debe tener al menos 2 caracteres' });
            }

            let results = {};

            // Búsqueda de usuarios
            if (type === 'all' || type === 'users') {
                const users = await userRepository.search(query, limit, page);
                results.users = users;
            }

            // Búsqueda de proyectos
            if (type === 'all' || type === 'projects') {
                const projects = await projectRepository.search(query, limit, page);
                results.projects = projects;
            }

            // Búsqueda de publicaciones
            if (type === 'all' || type === 'posts') {
                // Extraer IDs de usuarios encontrados para incluirlos en la búsqueda de posts
                const userIds = results.users ? results.users.map(u => u._id) : [];
                
                // Si type es solo 'posts', buscamos a los usuarios igual para sacar sus IDs
                if (type === 'posts') {
                    const tempUsers = await userRepository.search(query, limit, page);
                    userIds.push(...tempUsers.map(u => u._id));
                }

                const posts = await postRepository.search(query, userIds, limit, page);
                results.posts = posts;
            }

            return res.status(200).json({ ok: true, data: results });

        } catch (error) {
            console.error('Error en búsqueda:', error);
            return res.status(500).json({ ok: false, message: 'Error interno del servidor al buscar' });
        }
    }
}

export default new SearchController();
