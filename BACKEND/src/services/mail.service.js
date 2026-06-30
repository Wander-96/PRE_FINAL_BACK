import ENVIRONMENT from "../config/environment.config.js";

class MailService {
    async sendInvitationEmail(to, accept_url, reject_url, role) {
        try {
            await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': ENVIRONMENT.BREVO_API_KEY,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: 'MIB App', email: ENVIRONMENT.GMAIL_USERNAME },
                    to: [{ email: to }],
                    subject: "Te han invitado a un nuevo proyecto musical!",
                    htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #333; text-align: center;">¡Tienes una nueva invitación!</h2>
                        <p style="color: #555; font-size: 16px;">
                            Has sido invitado para unirte a un proyecto musical con el rol de <strong>${role}</strong>.
                        </p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${accept_url}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Aceptar Invitación</a>
                            <a href="${reject_url}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Rechazar</a>
                        </div>
                        <p style="color: #777; font-size: 12px; margin-top: 30px; text-align: center;">
                            Si no esperabas esta invitación, puedes ignorar este correo.
                        </p>
                    </div>
                    `
                })
            });;
        } catch (error) {
            console.error("Error al enviar el correo de invitacion", error);
            throw error;
        }
    }
}

const mailService = new MailService();
export default mailService;
