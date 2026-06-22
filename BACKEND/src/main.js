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

// Solo necesario si tienes problemas de DNS al conectar a MongoDB localmente
import dns from 'dns';
if (ENVIRONMENT.MODE === 'development') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

// 1. Conectamos a la Base de Datos
connectMongoDB();

// 2. Iniciamos la aplicación Express (Servidor Principal)
const app = express();
const PORT = ENVIRONMENT.PORT;

// 2.5 Fusionamos Express con el Servidor HTTP nativo de Node y le conectamos Socket.io
const httpServer = createServer(app);
initializeSockets(httpServer);

// 3. Configuraciones básicas
app.use(cors()); // Permite peticiones desde el frontend (CORS)
app.use(express.json()); // Permite que Express entienda el req.body en formato JSON

// 4. Configuración de Rutas de Autenticación
// Toda ruta que empiece con '/api/auth' será manejada por authRouter
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/posts', postRouter);
app.use('/api/users', userRouter);
app.use('/api/search', searchRouter);

// 5. Middleware Global de Manejo de Errores (Archivos e Imágenes)
app.use((err, req, res, next) => {
    console.error("🔥 Error Global:", err);
    if (err.message && err.message.includes('Must supply api_key')) {
        return res.status(500).json({ ok: false, message: "Error de Cloudinary: Revisa que tu API Key, Secret y Cloud Name estén correctamente puestos en el archivo .env y hayas guardado el archivo." });
    }
    return res.status(500).json({ ok: false, message: err.message || "Error interno", detalle: err });
});

// 6. Encendemos el Servidor HTTP (que ahora tiene a Express y Socket.io adentro)
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor REST y Sockets corriendo en http://localhost:${PORT}`);
});
