import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.config.js';

/* 
Seguridad 1: Formatos y Destino
Configuramos a Cloudinary para que solo acepte imágenes válidas. 
Cualquier intento de subir un .exe o un script malicioso será bloqueado aquí mismo.
*/
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mib_uploads', // Todas tus imágenes irán a esta carpeta en la nube
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'webm'],
    resource_type: 'auto', // Permite que Cloudinary identifique si es video o imagen
  },
});

/* 
Seguridad 2: Peso Máximo
Inicializamos Multer con un límite de 100 Megabytes para permitir videos de hasta ~10 minutos. 
*/
const uploadMiddleware = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } 
});

export default uploadMiddleware;
