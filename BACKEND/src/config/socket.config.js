import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import ENVIRONMENT from "./environment.config.js";

let io;

export const initializeSockets = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    //  MIDDLEWARE DE SEGURIDAD PARA SOCKETS
    // Al igual que las rutas HTTP, interceptamos la conexión para validar credenciales (Token JWT)
    io.use((socket, next) => {
        const token = socket.handshake.auth.token; // El Frontend envia el token aquí.

        if (!token) {
            return next(new Error("Acceso denegado: Token no proporcionado"));
        }

        try {
            const decoded = jwt.verify(token, ENVIRONMENT.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (error) {
            return next(new Error("Acceso denegado: Token inválido"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`🟢 Usuario conectado al Socket en tiempo real: ${socket.user.id}`);

        socket.join(socket.user.id);

        socket.on("disconnect", () => {
            console.log(`🔴 Usuario desconectado: ${socket.user.id}`);
        });
    });
};


export const getIo = () => {
    if (!io) {
        console.warn("Socket.io aún no está inicializado");
    }
    return io;
};
