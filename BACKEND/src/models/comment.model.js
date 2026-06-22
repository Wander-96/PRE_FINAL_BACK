import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
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
        },
        content: {
            type: String,
            required: true,
            maxlength: 2000
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'DELETED'],
            default: 'ACTIVE'
        }
    },
    { timestamps: true }
)

const Comment = mongoose.model('Comment', commentSchema)
export default Comment
