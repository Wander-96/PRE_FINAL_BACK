import { v2 as cloudinary } from 'cloudinary';
import ENVIRONMENT from './environment.config.js';

// Inicializamos el SDK de Cloudinary con las llaves que nos trajimos del .env
cloudinary.config({
  cloud_name: ENVIRONMENT.CLOUDINARY_CLOUD_NAME,
  api_key: ENVIRONMENT.CLOUDINARY_API_KEY,
  api_secret: ENVIRONMENT.CLOUDINARY_API_SECRET
});

export default cloudinary;
