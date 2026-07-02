import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.config.js';

// Validación estricta de archivos.
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mib_uploads', // Directorio remoto.
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'webm'],
    resource_type: 'auto', // Auto-detección de formato.
  },
});

// Límite de tamaño.
const uploadMiddleware = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } 
});

export default uploadMiddleware;
