/*
Generación de modelo ODM Mongoose.
*/
import mongoose from 'mongoose'

/*
Esquema de base de datos para el modelo Project.
La relación N:M con los usuarios se delega al modelo ProjectMembers para normalización.
*/

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now() // Captura el instante en el que se crea el espacio
    },
    description: {
        type: String,
        required: false // Es el único campo opcional (puede estar vacío)
    },
    cover_image: {
        type: String,
        required: false // URL de Cloudinary para la portada
    },
    status: {
        type: Boolean,
        required: true,
        default: true // Útil para desactivar (borrar lógicamente) un espacio en lugar de eliminar los datos reales
    }
}

)

// Extraemos el nombre a una constante para exportarlo igual que hicimos con User
export const PROJECT_COLLECTION_NAME = "Project"

// Creamos y exportamos el Modelo
const Project = mongoose.model(PROJECT_COLLECTION_NAME, projectSchema);
export default Project
