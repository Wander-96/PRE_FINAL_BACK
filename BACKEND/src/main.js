import express from "express";
import cors from 'cors';
import { createServer } from 'http';
import { initializeSockets } from './config/socket.config.js';
import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongodb.config.js";
import authRouter from "./routes/auth.router.js";
import projectRouter from "./routes/project.router.js";
import postRouter from "./routes/post.router.js";
import userRouter from "./routes/user.router.js";
import searchRouter from "./routes/search.router.js";
import commentRouter from "./routes/comment.router.js";
import feedRouter from "./routes/feed.router.js";
import notificationRouter from "./routes/notification.router.js";
import messageRouter from "./routes/message.route.js";

// Configuración de DNS para desarrollo local
import dns from 'dns';
if (ENVIRONMENT.MODE === 'development') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

// Conexión a Base de Datos
connectMongoDB();

// Inicialización de la aplicación Express
const app = express();
const PORT = ENVIRONMENT.PORT;

// Fusión de Express con Servidor HTTP nativo y Socket.io
const httpServer = createServer(app);
initializeSockets(httpServer);

// Middlewares Globales
app.use(cors());
app.use(express.json());

// Configuración de Rutas
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/posts', postRouter);
app.use('/api/users', userRouter);
app.use('/api/search', searchRouter);
app.use('/api/comments', commentRouter);
app.use('/api/feed', feedRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/messages', messageRouter);

// Middleware Global de Manejo de Errores
app.use((err, req, res, next) => {
    console.error("🔥 Error Global:", err);
    if (err.message && err.message.includes('Must supply api_key')) {
        return res.status(500).json({ ok: false, message: "Error de Cloudinary: Revisa que tu API Key, Secret y Cloud Name estén correctamente puestos en el archivo .env y hayas guardado el archivo." });
    }
    return res.status(500).json({ ok: false, message: err.message || "Error interno", detalle: err });
});

// Inicialización del Servidor HTTP
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor REST y Sockets corriendo en http://localhost:${PORT}`);
});
