# 🎤 Defensa Oral: Detalles Técnicos Clave del Backend

Para defender tu proyecto con seguridad, aquí tienes explicados de forma simple, directa y profesional los tres pilares técnicos por los que te pueden preguntar.

---

## 1. Manejo de Archivos (Imágenes de Posts/Perfil)

**¿Cómo funciona y dónde se almacenan?**
Nuestros archivos no se guardan en el disco duro de nuestro servidor (lo cual sería una mala práctica porque llenaría nuestro servidor rápidamente). Usamos una arquitectura moderna basada en la nube:

1. **Recepción (Multer):** Cuando el Frontend envía una imagen, usamos una librería llamada `multer`. Configuramos Multer en **modo memoria** (`memoryStorage`). Esto significa que la imagen se ataja al vuelo y se guarda en la memoria RAM del servidor temporalmente, sin tocar el disco duro.
2. **Subida a la Nube (Cloudinary):** Inmediatamente, tomamos ese archivo de la memoria y lo disparamos hacia los servidores de **Cloudinary** (un servicio profesional de alojamiento de multimedia).
3. **Almacenamiento (MongoDB):** Cloudinary recibe la imagen, la guarda en sus súper servidores y nos devuelve un simple `String` (una URL segura, ej: `https://res.cloudinary.com/.../imagen.jpg`). Ese texto es lo único que guardamos en nuestra base de datos MongoDB.

**Resumen para replicar:** 
*Frontend (FormData) -> Backend (Multer RAM) -> Cloudinary (Nube) -> MongoDB (Guarda la URL).*

---

## 2. Mensajes y Notificaciones en Tiempo Real

**¿Cómo funciona la magia instantánea?**
Las peticiones web normales (HTTP) funcionan como el correo postal: el cliente pide y el servidor responde. Para el tiempo real, necesitamos una llamada telefónica abierta. Para eso usamos **Socket.io** (WebSockets).

1. **La Conexión Inicial:** El servidor HTTP tradicional de Express fue "envuelto" con Socket.io. Cuando un usuario inicia sesión en el Frontend, establece un túnel bidireccional constante con el Backend.
2. **Salas Privadas (Rooms):** Para que las notificaciones no le lleguen a todo el mundo, apenas el usuario se conecta, el Backend lo mete en una "Sala Privada" nombrada con su propio ID de base de datos (`socket.join(userId)`).
3. **Emisión de Eventos:** Si el Usuario A le da "Like" al Post del Usuario B, el controlador del Backend registra el Like en MongoDB y luego ejecuta: `io.to(Usuario_B_ID).emit('nueva_notificacion', datos)`.
4. **Recepción:** Como el Usuario B está conectado en esa sala, recibe el aviso instantáneamente sin tener que recargar la página.

---

## 3. Implementación de la Arquitectura (El patrón "Repository / Services")

Es muy probable que te pregunten cómo organizaste el código. Tu Backend no es un espagueti, utiliza una arquitectura profesional de **Capas Separadas**:

1. **Routes (Rutas):** Son los recepcionistas. Solo miran la URL (`/api/posts`) y dicen: *"Ah, esto le toca al PostController"*.
2. **Controllers (Controladores):** Son los gerentes. Validan que los datos estén bien (ej: que el nombre tenga más de 2 letras), deciden qué hacer y responden al Frontend con códigos de estado (200 OK, 400 Error). **Pero el controlador NUNCA toca la base de datos directamente.**
3. **Repositories (Repositorios):** Aquí está el verdadero "Servicio de Datos". Son los operarios del almacén. El Controlador le dice al Repositorio: *"Búscame al usuario con este email"*. El Repositorio es el **único** que tiene permisos para ejecutar comandos de Mongoose/MongoDB (`User.findOne(...)`). 

**¿Por qué lo hicimos así (Respuesta ganadora para el profesor)?**
*"Separamos la lógica de negocio (Controller) de la lógica de base de datos (Repository). Si mañana decidimos cambiar MongoDB por PostgreSQL o MySQL, no tenemos que tocar ni un solo Controlador; solo reescribimos los Repositorios. Es un código escalable y mantenible."*

*(Nota: En el **Frontend** sí tenemos una carpeta `services/` (ej: `authService.js`). Su función es puramente comunicarse con el Backend usando `fetch()`. Esto evita tener `fetchs` gigantes y sucios mezclados dentro de los componentes visuales de React).*
