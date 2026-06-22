# Tareas: Notificaciones en Tiempo Real (Socket.io)

- [x] **1. Instalación y Configuración del Servidor**
  - [x] Ejecutar `npm install socket.io`.
  - [x] Crear `src/config/socket.config.js`.
  - [x] Modificar `src/main.js` para levantar el servidor HTTP nativo con Sockets.

- [x] **2. Seguridad (Middleware de Sockets)**
  - [x] Implementar la validación de `JWT` dentro de la conexión del socket (en `socket.config.js`).

- [x] **3. Emisión de Alertas**
  - [x] Añadir emisión en `like.service.js` (`getIo().to(ownerId).emit(...)`).
  - [x] Añadir emisión en `comment.service.js`.
