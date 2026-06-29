import mongoose from "mongoose";
import { USER_COLLECTION_NAME } from "./user.model.js";

const connectionSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_COLLECTION_NAME,
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_COLLECTION_NAME,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Avoid duplicate connection requests between the same users
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const CONNECTION_COLLECTION_NAME = 'Connection';

const Connection = mongoose.model(CONNECTION_COLLECTION_NAME, connectionSchema);

export default Connection;
