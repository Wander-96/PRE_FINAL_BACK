import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import ENVIRONMENT from "./environment.config.js";

let io; // Instancia global

export const initializeSockets = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // Permite al Frontend conectarse desde cualquier puerto (ej. localhost:5173)
            methods: ["GET", "POST"]
        }
    });

    // 🔒 MIDDLEWARE DE SEGURIDAD PARA SOCKETS
    // Al igual que las rutas HTTP, interceptamos la conexión para validar credenciales (Token JWT)
    io.use((socket, next) => {
        const token = socket.handshake.auth.token; // El Frontend debe mandar el token aquí
        
        if (!token) {
            return next(new Error("Acceso denegado: Token no proporcionado"));
        }
        
        try {
            const decoded = jwt.verify(token, ENVIRONMENT.JWT_SECRET);
            socket.user = decoded; // Guardamos los datos del usuario en la memoria de su socket
            next(); // Autorización concedida, acceso permitido
        } catch (error) {
            return next(new Error("Acceso denegado: Token inválido"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`🟢 Usuario conectado al Socket en tiempo real: ${socket.user.id}`);
        
        // Diseño Arquitectónico: 
        // Socket.io permite "salas" (rooms). Metemos al usuario en una sala que se llama EXACTAMENTE igual que su ID.
        // Así, si queremos mandarle una notificación privada a Lake, solo hacemos: io.to(lake_id).emit('alerta', ...)
        socket.join(socket.user.id);

        socket.on("disconnect", () => {
            console.log(`🔴 Usuario desconectado: ${socket.user.id}`);
        });
    });
};

// Exportamos esta función para poder disparar notificaciones desde like.service.js o comment.service.js
export const getIo = () => {
    if (!io) {
        console.warn("Socket.io aún no está inicializado");
    }
    return io;
};
