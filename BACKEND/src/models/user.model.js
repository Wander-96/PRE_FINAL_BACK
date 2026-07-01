import mongoose from "mongoose";

/*
El "Schema" es como el plano de un edificio. Define exactamente qué campos
puede tener un usuario, de qué tipo son y si son obligatorios o no.
Mongoose usará esto para evitar que guardemos basura en la base de datos.
*/

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        default: ""
    },
    birth_date: {
        type: Date,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true, // Asegura que no haya dos usuarios con el mismo correo
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "" // URL a la imagen
    },
    cover_photo: {
        type: String,
        default: "" // URL a la imagen de portada
    },
    bio: {
        type: String,
        default: ""
    },
    instruments: {
        type: [String],
        default: [] // ["Guitarra", "Voz"]
    },
    social_links: {
        type: Map,
        of: String,
        default: {} // { instagram: "link", spotify: "link" }
    },
    email_verified: {
        type: Boolean,
        default: false,
        required: true,
    },
    country: {
        type: String,
        default: ""
    },
    is_profile_complete: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now // Si no pasamos fecha, MongoDB tomará el instante actual por defecto
    },
    is_active: {
        type: Boolean,
        required: true,
        default: true // Útil para "borrado lógico" (desactivar al usuario sin borrar sus datos)
    }
}
)

/*
Extraer el nombre del modelo a una constante es una excelente práctica.
Evita errores de tipeo ('User' vs 'user') cuando necesitemos hacer relaciones con otros modelos (como el Project).
*/

export const USER_COLLECTION_NAME = 'User'

// Creamos el modelo usando la constante y el esquema
const User = mongoose.model(USER_COLLECTION_NAME, userSchema)

// Lo exportamos por defecto para usarlo en el Repositorio
export default User