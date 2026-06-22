# 📊 Guía de Presentación Oral: Backend MIB

Para tu presentación de mañana, aquí tienes la estructura exacta que necesitas para armar tu diagrama en **DrawDB**, además de un resumen de tus Endpoints y el Flujo de Usuario.

---

## 1. Base de Datos (Estructura para DrawDB)

En DrawDB vas a crear **6 Tablas**. Mongoose en Node.js es NoSQL, pero para diagramar y explicarlo se modela como relaciones exactas. 

### Tabla: `users`
*Representa los perfiles de los músicos.*
- `_id` (Object ID / PK)
- `name` (VARCHAR)
- `email` (VARCHAR - Unique)
- `password` (VARCHAR)
- `avatar` (VARCHAR - URL Cloudinary)
- `bio` (TEXT)
- `instruments` (ARRAY de VARCHAR)

### Tabla: `projects`
*Representa las bandas o espacios musicales.*
- `_id` (Object ID / PK)
- `name` (VARCHAR)
- `description` (TEXT)
- `cover_image` (VARCHAR - URL Cloudinary)
- `status` (BOOLEAN)

### Tabla: `project_members` (Tabla Intermedia)
*La genialidad de esta tabla es que evita la saturación. Conecta a los Usuarios con las Bandas y maneja las invitaciones.*
- `_id` (Object ID / PK)
- `fk_id_user` (FK -> `users._id`)
- `fk_id_project` (FK -> `projects._id`)
- `role` (ENUM: 'OWNER', 'ADMIN', 'MEMBER', 'GUEST')
- `status` (ENUM: 'PENDING', 'ACCEPTED', 'REJECTED')

### Tabla: `posts`
*Las publicaciones del muro global.*
- `_id` (Object ID / PK)
- `fk_id_user` (FK -> `users._id`) - *Autor del post*
- `content` (TEXT)
- `media` (ARRAY de Objetos) - *Fotos/Videos*
- `likesCount` (INTEGER) - *Caché para optimizar lectura*
- `commentsCount` (INTEGER) - *Caché para optimizar lectura*

### Tabla: `likes`
- `_id` (Object ID / PK)
- `fk_id_user` (FK -> `users._id`)
- `fk_id_post` (FK -> `posts._id`)

### Tabla: `comments`
- `_id` (Object ID / PK)
- `fk_id_user` (FK -> `users._id`)
- `fk_id_post` (FK -> `posts._id`)
- `content` (TEXT)

### 🔀 Relaciones (Las líneas a dibujar en DrawDB)
1. **users** (1) ──── (N) **project_members**
2. **projects** (1) ──── (N) **project_members**
3. **users** (1) ──── (N) **posts** *(Un usuario crea muchos posts)*
4. **posts** (1) ──── (N) **likes** *(Un post recibe muchos likes)*
5. **users** (1) ──── (N) **likes** *(Un usuario da muchos likes)*
6. **posts** (1) ──── (N) **comments** *(Un post recibe muchos comentarios)*
7. **users** (1) ──── (N) **comments** *(Un usuario hace muchos comentarios)*

---

## 2. Endpoints Principales (Para mencionar)
Puedes resumir tu arquitectura RESTful en 5 bloques:
1. **Auth:** `/api/auth/register`, `/api/auth/login` (Autenticación con JWT).
2. **Users:** `/api/users/me` (Perfiles y subida de Avatar a Cloudinary).
3. **Projects:** `/api/projects` (CRUD de bandas e invitaciones a músicos).
4. **Posts:** `/api/posts` (Muro, paginación, likes y comentarios).
5. **Search:** `/api/search?q=` (Motor de búsqueda global de músicos y bandas).

---

## 3. Flujo de Usuario Principal
Si te piden explicar el "Happy Path" (El camino ideal del usuario), es este:
1. **Registro/Login:** El músico se registra y obtiene su Token JWT. Sube su Avatar.
2. **Networking (Feed):** Entra al muro, lee posts de otros, da *Likes* y *Comenta*.
3. **Búsqueda:** Usa el buscador para encontrar un bajista.
4. **Creación de Banda:** Crea un Proyecto llamado "Rockeros".
5. **Invitación:** Envía una invitación al bajista usando su ID. El bajista acepta (cambia status a `ACCEPTED` en `project_members`).
6. **Tiempo Real:** Todo esto dispara alertas WebSockets (`Socket.io`).
