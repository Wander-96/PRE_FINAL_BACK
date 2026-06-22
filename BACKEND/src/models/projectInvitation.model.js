import mongoose from "mongoose";
import { PROJECT_COLLECTION_NAME } from "./project.model.js";
import { USER_COLLECTION_NAME } from "./user.model.js";
import { MEMBER_PROJECT_ROLES } from "../constants/memberRoles.constant.js";
import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";

const projectInvitationSchema = new mongoose.Schema({
    //Espacio de invitacion
    fk_id_project: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: PROJECT_COLLECTION_NAME
    },

    //Quien invita
    fk_id_invited_by: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: USER_COLLECTION_NAME
    },

    //Email al que enviamos la invitacion
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    //Rol que tendra el usuario si acepta la invitacion
    role: {
        enum: [MEMBER_PROJECT_ROLES.ADMIN, MEMBER_PROJECT_ROLES.OWNER, MEMBER_PROJECT_ROLES.USER],
        type: String,
        default: MEMBER_PROJECT_ROLES.USER
    },

    //Estado actual
    status: {
        enum: [MEMBER_INVITATION_STATUS.PENDING, MEMBER_INVITATION_STATUS.ACCEPTED,
        MEMBER_INVITATION_STATUS.REJECTED],
        type: String,
        default: MEMBER_INVITATION_STATUS.PENDING
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date,
        required: true
    }
})

export const PROJECT_INVITATION_MODEL_NAME = 'ProjectInvitation'
const ProjectInvitation = mongoose.model(PROJECT_INVITATION_MODEL_NAME, projectInvitationSchema)

export default ProjectInvitation;