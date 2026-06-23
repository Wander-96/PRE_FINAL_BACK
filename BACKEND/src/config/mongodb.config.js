import mongoose from "mongoose";
import ENVIRONMENT from "./environment.config.js";

/* 
Conexión a DB separada para permitir que nuestro archivo "main.js" quede más limpio,
y facilita la migracion cambiando solo esta capa de Configuración.
*/

const connectMongoDB = async () => {
    try {
        const response = await mongoose.connect(ENVIRONMENT.MONGO_DB_CONNECTION_STRING, {
            dbName: ENVIRONMENT.MONGO_DB_NAME
        })
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error al conectar a MongoDB: ', error)
    }

}

export default connectMongoDB;