# 🚀 Guía Definitiva de Pruebas: Postman MIB API

Esta es la lista exhaustiva de todas las rutas que hemos construido en el Backend. Tómate esto como la "Biblia" de tu API. Asegúrate de configurar el `access_token` en la pestaña `Authorization` -> `Bearer Token` de tu colección para las rutas protegidas.

---

## 🔐 1. Seguridad (`/api/auth`)

| Petición | Método | URL | Body (JSON) | Descripción |
| :--- | :---: | :--- | :--- | :--- |
| **Register** | `POST` | `/api/auth/register` | `{ "name": "Lake", "email": "lake@mib.com", "password": "password123" }` | Crea una cuenta. *(Requiere validación manual de email en DB)* |
| **Login** | `POST` | `/api/auth/login` | `{ "email": "lake@mib.com", "password": "password123" }` | **¡Importante!** Devuelve el `access_token`. |
| **Reset Password Request** | `POST` | `/api/auth/reset-password-request` | `{ "email": "lake@mib.com" }` | Envía email con token de reseteo. |
| **Reset Password Confirm** | `POST` | `/api/auth/reset-password-confirm` | `{ "newPassword": "newpassword321" }` | *(Requiere el token del email en el Header)*. Actualiza la contraseña. |

---

## 🎸 2. Proyectos Musicales (`/api/projects`)

| Petición | Método | URL | Body (JSON) | Descripción |
| :--- | :---: | :--- | :--- | :--- |
| **Create Project** | `POST` | `/api/projects` | `{ "name": "The Cyberpunks", "description": "Banda Synthwave" }` | Crea una banda y te asigna como `OWNER`. |
| **Get My Projects** | `GET` | `/api/projects` | *Ninguno* | Lista todas las bandas a las que perteneces. |
| **Update Project** | `PUT` | `/api/projects/:project_id` | `{ "name": "The Cyberpunks V2" }` | Edita la info de la banda. *(Requiere ser ADMIN u OWNER)*. |
| **Delete Project** | `DELETE` | `/api/projects/:project_id` | *Ninguno* | Borrado lógico de la banda. *(Requiere ser OWNER)*. |

### ✉️ Invitaciones a Proyectos
| Petición | Método | URL | Body (JSON) | Descripción |
| :--- | :---: | :--- | :--- | :--- |
| **Invite Member** | `POST` | `/api/projects/:project_id/members` | `{ "invited_email": "amigo@mib.com", "role": "USER" }` | Envía invitación por email a un usuario registrado. |
| **Process Invitation** | `PUT` | `/api/projects/invitations/:decision?token=ABC` | *Ninguno* | `:decision` debe ser `ACEPTADO` o `RECHAZADO`. El token viene del email. |

---

## 📰 3. Muro de Publicaciones (`/api/posts`)

| Petición | Método | URL | Body (JSON) | Descripción |
| :--- | :---: | :--- | :--- | :--- |
| **Create Post** | `POST` | `/api/posts` | `{ "content": "¡Hola MIB!", "media": [{ "url": "foto.jpg", "type": "IMAGE" }] }` | Publica en el muro global. |
| **Get Feed** | `GET` | `/api/posts?limit=10&page=1` | *Ninguno* | Obtiene el muro completo con paginación, autores y conteo de likes. |
| **Update Post** | `PUT` | `/api/posts/:postId` | `{ "content": "Texto editado" }` | Edita el post. **Regla:** Tienes 15 minutos máximo. |
| **Delete Post** | `DELETE` | `/api/posts/:postId` | *Ninguno* | Borrado lógico del post. |

---

## ❤️ 4. Likes y Comentarios

| Petición | Método | URL | Body (JSON) | Descripción |
| :--- | :---: | :--- | :--- | :--- |
| **Toggle Like** | `POST` | `/api/posts/:postId/like` | *Ninguno* | Da "Me gusta". Si repites la petición, quita el "Me gusta". |
| **Create Comment** | `POST` | `/api/posts/:postId/comments` | `{ "content": "Gran publicación" }` | Añade un comentario a un post específico. |
| **Get Comments** | `GET` | `/api/posts/:postId/comments` | *Ninguno* | Trae todos los comentarios de un post con paginación. |
| **Update Comment** | `PUT` | `/api/posts/comments/:commentId` | `{ "content": "Comentario editado" }` | Edita el comentario. **Regla:** 15 minutos máximo. |
| **Delete Comment** | `DELETE` | `/api/posts/comments/:commentId` | *Ninguno* | Elimina tu propio comentario. |
