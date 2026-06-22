import mongoose from 'mongoose'

const likeSchema = new mongoose.Schema(
    {
        fk_id_post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        },
        fk_id_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
)

// lógica PURA: Índice Compuesto Único
// Esto le dice a MongoDB a nivel de motor: "Es IMPOSIBLE que existan dos documentos con el mismo Post y Usuario"
likeSchema.index({ fk_id_post: 1, fk_id_user: 1 }, { unique: true })

const Like = mongoose.model('Like', likeSchema)
export default Like
