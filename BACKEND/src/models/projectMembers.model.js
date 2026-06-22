import mongoose from "mongoose";
// Importamos las constantes de los nombres exactos de los modelos que creamos antes
import { PROJECT_COLLECTION_NAME } from "./project.model.js";
import { USER_COLLECTION_NAME } from "./user.model.js";
import { MEMBER_PROJECT_ROLES } from "../constants/memberRoles.constant.js";

const projectMemberSchema = new mongoose.Schema({
    /*
    fk (Foreign Key / Llave Foránea): Esto le indica a MongoDB que aquí 
    no guardaremos texto normal, sino el ID único de un documento que vive en la colección "Project".
    El 'ref' le dice exactamente en qué colección buscar ese ID.
    */
    fk_id_project: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: PROJECT_COLLECTION_NAME
    },
    /*
    Igual que el de arriba, pero conectando el ID de un Usuario real.
    */
    fk_id_user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: USER_COLLECTION_NAME
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: true
    },
    role: {
        // "enum" restringe las opciones: el rol SOLO puede ser uno de estos 3 valores estrictos.
        enum: [MEMBER_PROJECT_ROLES.ADMIN, MEMBER_PROJECT_ROLES.OWNER, MEMBER_PROJECT_ROLES.USER],
        type: String,
        default: MEMBER_PROJECT_ROLES.USER
    }
})

export const PROJECT_MEMBER_MODEL_NAME = 'ProjectMember'
const ProjectMember = mongoose.model(PROJECT_MEMBER_MODEL_NAME, projectMemberSchema)

export default ProjectMember
