import ENVIRONMENT from "../config/environment.config.js";
import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";
import ServerError from "../helpers/serverError.helper.js";
import userRepository from "../repositories/user.repository.js";
import projectMemberRepository from "../repositories/projectMember.repository.js";
import projectInvitationRepository from "../repositories/projectInvitation.repository.js";
import jwt from 'jsonwebtoken';
import mailService from "./mail.service.js";

class MemberProjectService {

    // Enviar invitación a proyecto
    async inviteUser(user_invited_by_id, user_invited_email, project_id, role) {
        const userToInvite = await userRepository.getByEmail(user_invited_email);
        if (!userToInvite) {
            throw new ServerError("El correo ingresado no pertenece a ningun usuario registado", 404);
        }

        const isAlreadyMember = await projectMemberRepository.getByUserAndProjectId(userToInvite._id, project_id);
        if (isAlreadyMember) {
            throw new ServerError("El usuario ya esta registrado en el proyecto musical", 400);
        }

        const previousInvitation = await projectInvitationRepository.getByProjectAndEmail(project_id, user_invited_email);
        if (previousInvitation) {
            if (previousInvitation.status === MEMBER_INVITATION_STATUS.PENDING) {
                if (previousInvitation.expires_at > new Date()) {
                    throw new ServerError("Usuario con invitacion ya enviado, y pendiente", 400);

                } else {
                    await projectInvitationRepository.deleteById(previousInvitation._id);
                }
            }
            if (previousInvitation.status === MEMBER_INVITATION_STATUS.REJECTED) {
                throw new ServerError("Este usuario ya rechazo la invitacion anteriormente", 400);
            }
            if (previousInvitation.status === MEMBER_INVITATION_STATUS.ACCEPTED) {
                await projectInvitationRepository.deleteById(previousInvitation._id);
            }
        }

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        const newInvitation = await projectInvitationRepository.create(
            project_id,
            user_invited_by_id,
            user_invited_email,
            role,
            expirationDate
        );

        const invitation_token = jwt.sign(
            { invitation_id: newInvitation._id },
            ENVIRONMENT.JWT_SECRET,
            { expiresIn: '30d' }
        );

        const accept_url = `${ENVIRONMENT.URL_BACKEND}/api/project/${project_id}/members/${MEMBER_INVITATION_STATUS.ACCEPTED}?token=${invitation_token}`;
        const reject_url = `${ENVIRONMENT.URL_BACKEND}/api/project/${project_id}/members/${MEMBER_INVITATION_STATUS.REJECTED}?token=${invitation_token}`;

        await mailService.sendInvitationEmail(user_invited_email, accept_url, reject_url, role);
    }

    async processInvitation(invitation_token, decision) {
        const decoded = jwt.verify(invitation_token, ENVIRONMENT.JWT_SECRET);

        const invitation = await projectInvitationRepository.getById(decoded.invitation_id);
        if (!invitation) {
            throw new ServerError("Invitacion no encontrada o token invalido", 404);
        }

        if (invitation.status !== MEMBER_INVITATION_STATUS.PENDING) {
            throw new ServerError("Esta invitacion ya fue procesada anteriormente", 400);
        }

        if (decision === MEMBER_INVITATION_STATUS.ACCEPTED) {
            const userThatAccepted = await userRepository.getByEmail(invitation.email);

            await projectMemberRepository.create(
                userThatAccepted._id,
                invitation.fk_id_project,
                invitation.role
            );

            await projectInvitationRepository.updateById(invitation._id, { status: MEMBER_INVITATION_STATUS.ACCEPTED });
        }

        if (decision === MEMBER_INVITATION_STATUS.REJECTED) {
            await projectInvitationRepository.updateById(invitation._id, { status: MEMBER_INVITATION_STATUS.REJECTED });
        }
    }
}

const memberProjectService = new MemberProjectService();
export default memberProjectService;
