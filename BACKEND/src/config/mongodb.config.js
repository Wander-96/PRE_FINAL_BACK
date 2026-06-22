import mongoose from "mongoose";
import ENVIRONMENT from "./environment.config.js";

/* 
¿Por qué en un archivo separado?
Separar la conexión a DB permite que nuestro archivo "main.js" quede más limpio,
y si mañana migramos a PostgreSQL o Firebase, el cambio se limita a esta capa de Configuración.
*/

const connectMongoDB = async () => {
    try {
        // Le pedimos a Mongoose que se conecte usando el STRING y el nombre de la BD secretos
        const response = await mongoose.connect(ENVIRONMENT.MONGO_DB_CONNECTION_STRING, {
            dbName: ENVIRONMENT.MONGO_DB_NAME
        })
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error al conectar a MongoDB: ', error)
    }

}

// OBLIGATORIO: exportarlo para que "main.js" pueda llamarlo al encender el servidor
export default connectMongoDB;