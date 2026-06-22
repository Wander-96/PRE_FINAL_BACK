import dotenv from 'dotenv'

/* 
Carga las variables de entorno desde el archivo .env en process.env.
*/
dotenv.config()

/* 
Objeto de configuración centralizado para el entorno de la aplicación.
Facilita la mantenibilidad y previene referencias nulas.
*/
const ENVIRONMENT = {
    MONGO_DB_CONNECTION_STRING: process.env.MONGO_DB_CONNECTION_STRING,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    MODE: process.env.MODE,
    PORT: process.env.PORT,
    GMAIL_USERNAME: process.env.GMAIL_USERNAME,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    URL_BACKEND: process.env.URL_BACKEND,
    JWT_SECRET: process.env.JWT_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}

// Lo exportamos para usarlo en cualquier lugar del proyecto
export default ENVIRONMENT;
