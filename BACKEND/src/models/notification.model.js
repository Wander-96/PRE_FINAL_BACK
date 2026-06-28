import mongoose from "mongoose";
import { USER_COLLECTION_NAME } from "./user.model.js";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_COLLECTION_NAME,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_COLLECTION_NAME,
        required: true
    },
    type: {
        type: String,
        enum: ['LIKE', 'COMMENT', 'PROJECT_INVITATION', 'FOLLOW'],
        required: true
    },
    related_entity: {
        type: mongoose.Schema.Types.ObjectId, // Puede ser el ID de un Post, Proyecto, etc.
        required: false
    },
    is_read: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

export const NOTIFICATION_COLLECTION_NAME = 'Notification';

const Notification = mongoose.model(NOTIFICATION_COLLECTION_NAME, notificationSchema);

export default Notification;
