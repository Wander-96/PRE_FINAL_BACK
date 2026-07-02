# MIB (Music Is Better) - Backend 🎛️

Bienvenido al repositorio Backend de **MIB**, el motor robusto que da vida a nuestra red social para músicos.

## 🌐 Despliegue en Vivo
- **URL de la Web (Frontend):** https://mib-lemon.vercel.app/
- **URL de la API (Backend):** https://mib-backend-w7ti.onrender.com

## 🛠️ Tecnologías Utilizadas
- **Node.js** con **Express** (Arquitectura en capas: Routes, Controllers, Services, Repositories).
- **MongoDB** con **Mongoose** para modelado de datos.
- **JSON Web Tokens (JWT)** y **Bcrypt** para autenticación segura y hashing.
- **Socket.io** para comunicaciones WebSocket (Chat en tiempo real).
- **Multer** y **Cloudinary** para subida y almacenamiento de imágenes y portadas.
- **Nodemailer** para la verificación de correos electrónicos.

## 🚧 En Construcción / Próximamente
Actualmente la API se encuentra en desarrollo activo. Los siguientes módulos **aún no están implementados**:
- **Mensajería en Tiempo Real:** Aunque la arquitectura básica con Socket.io está contemplada, los eventos bidireccionales de chat están en proceso de construcción.
- **Espacio "Proyectos":** Los endpoints para crear y gestionar bandas/proyectos (ej. `/api/projects`) se encuentran en construcción.
- **Autenticación Social:** Los endpoints para OAuth con Google y Apple se habilitarán en futuras versiones.

## 🚀 Instalación Local

1. Clona este repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura tus variables de entorno. Crea un archivo `.env` en la raíz de `BACKEND` con las siguientes claves:
   ```env
   PORT=3000
   URL_FRONT=http://localhost:5173
   MONGO_URI=tu_conexion_mongodb
   JWT_SECRET=tu_secreto_jwt
   EMAIL_USER=tu_email
   EMAIL_PASS=tu_contraseña_de_aplicacion
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   MODE=development
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 📖 Documentación de Endpoints Principales

### Autenticación (`/api/auth`)
- `POST /register`: Registra un nuevo usuario y envía email de verificación.
- `GET /verify/:token`: Verifica la cuenta del usuario tras el registro.
- `POST /login`: Inicia sesión y devuelve un token JWT.
- `GET /verify-token`: Valida si el token actual sigue activo.

### Usuarios (`/api/users`)
- `GET /me`: Obtiene los datos del usuario logueado.
- `PUT /me`: Actualiza perfil (soporta campos `avatar` y `cover_photo` mediante Multer).
- `GET /:userId`: Obtiene el perfil público de otro músico.

### Búsqueda Global (`/api/search`)
- `GET /?q=termino`: Busca músicos por nombre/instrumento, o publicaciones por contenido textual.

### Publicaciones y Feed (`/api/posts` | `/api/feed`)
- `GET /api/feed`: Obtiene el muro general de publicaciones combinadas.
- `POST /api/posts`: Crea un nuevo post (texto y media).
- `PUT /api/posts/:id`: Edita una publicación existente.
- `DELETE /api/posts/:id`: Elimina una publicación propia.
- `POST /api/posts/:id/like`: Da o quita like a un post.

### Comentarios (`/api/comments`)
- `GET /post/:postId`: Obtiene los comentarios de una publicación.
- `POST /`: Agrega un comentario nuevo.

### Conexiones (`/api/connections`)
- `POST /send/:targetId`: Envía una solicitud de conexión.
- `PUT /accept/:connectionId`: Acepta una solicitud pendiente.
- `DELETE /:connectionId`: Elimina una conexión o cancela una solicitud.
- `GET /status/:targetId`: Obtiene el estado actual con otro usuario.
- `GET /user/:userId`: Lista todas las conexiones aceptadas de un usuario.

### Chat Privado y Notificaciones (`/api/messages` | `/api/notifications`)
- `GET /api/messages/:userId`: Obtiene el historial de chat con un usuario.
- `POST /api/messages`: Envía un nuevo mensaje directo.
- `GET /api/notifications`: Historial de notificaciones (Likes, Comentarios, Solicitudes).
- `PUT /api/notifications/:id/read`: Marca una notificación como leída.
