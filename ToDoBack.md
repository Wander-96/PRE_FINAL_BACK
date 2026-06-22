# Backlog: MIB Backend (Para la próxima sesión)

## 1. Buscador (Search Engine) (`/api/search`)
**Complejidad:** Baja/Media 🟡
**Implementación:**
- Crear un endpoint global o endpoints específicos para buscar bandas y usuarios.
- Usaremos expresiones regulares (`$regex`) de MongoDB para búsquedas insensibles a mayúsculas/minúsculas.
- `GET /api/search?q=cyber` buscará en Nombres de Usuarios y Nombres de Proyectos Musicales.

## 2. Subida de Archivos (Multer + Cloudinary)
**Complejidad:** Alta 🔴
**Implementación:**
- **Multer:** Middleware para interceptar los archivos de imagen/video que llegan desde el Frontend en formato `multipart/form-data`.
- **Cloudinary:** Servicio en la nube gratuito. Guardaremos los archivos en sus servidores y ellos nos devolverán una URL segura (ej: `https://res.cloudinary.com/foto.jpg`) que guardaremos en MongoDB.
- Se implementará para: Avatar de Usuario, Portada de Proyecto y Archivos Media en Posts.

## 3. Notificaciones en Tiempo Real (Socket.io)
**Complejidad:** Alta 🔴
**Implementación:**
- Instalar `socket.io` y acoplarlo a nuestro servidor de Express.
- Crear una sala (room) por cada usuario conectando (`user_id`).
- Modificar los servicios de `Like`, `Comment` e `Invitations` para que disparen eventos (ej: `server:notification`) en el momento exacto en que ocurren.
