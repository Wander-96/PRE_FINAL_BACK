import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import ENVIRONMENT from "./environment.config.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

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

        socket.on("send_message", async (data) => {
            try {
                const { conversationId, recipientId, content } = data;
                
                // Guardar en base de datos
                const message = new Message({
                    conversationId,
                    sender: socket.user.id,
                    content
                });
                await message.save();

                // Actualizar último mensaje en la conversación
                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: message._id
                });

                const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');

                // Emitir al receptor (si está conectado)
                io.to(recipientId).emit("receive_message", populatedMessage);
                
                // Emitir de vuelta al remitente para confirmación/actualización de UI
                socket.emit("message_sent", populatedMessage);

            } catch (error) {
                console.error("Error al procesar mensaje de socket:", error);
            }
        });

        socket.on("mark_as_read", async (data) => {
            try {
                const { conversationId } = data;
                await Message.updateMany(
                    { conversationId, sender: { $ne: socket.user.id }, isRead: false },
                    { $set: { isRead: true } }
                );
                // Aquí podríamos emitir un evento para actualizar el "visto"
            } catch (error) {
                console.error(error);
            }
        });

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
