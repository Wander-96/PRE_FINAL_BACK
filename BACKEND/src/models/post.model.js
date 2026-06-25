import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: false,
            default: '',
            maxlength: 8000 // Permitimos posts extensos, formato blog
        },
        media: {
            type: [{
                url: { type: String, required: true },
                type: { type: String, enum: ['IMAGE', 'VIDEO'], required: true },
                duration_seconds: { 
                    type: Number, 
                    max: 2400 // 40 minutos * 60 segundos
                }
            }],
            validate: {
                validator: function(v) {
                    return v.length <= 20;
                },
                message: 'No puedes subir más de 20 archivos (imágenes/videos) por publicación.'
            }
        },
        location: {
            type: String, // Guardará el texto manual ingresado por el usuario (ej: "Buenos Aires, Argentina")
            default: null
        },
        link_preview: { // Para mostrar la miniatura de YouTube o Spotify
            url: String,
            title: String,
            description: String,
            image: String
        },
        fk_id_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Referencia para cruce relacional (populate)
            required: true
        },
        fk_id_reposted_post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post', // Si es un "Retweet", guardamos el ID del post original
            default: null
        },
        likesCount: {
            type: Number,
            default: 0 // Caché del contador
        },
        commentsCount: {
            type: Number,
            default: 0 // Caché del contador
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'DELETED'],
            default: 'ACTIVE' // Borrado lógico (Soft Delete)
        }
    },
    {
        timestamps: true // Esto crea automáticamente 'createdAt' y 'updatedAt'
    }
)

const Post = mongoose.model('Post', postSchema)

export default Post
