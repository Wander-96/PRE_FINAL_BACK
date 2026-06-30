import nodemailer from 'nodemailer';
import ENVIRONMENT from './environment.config.js'

/*
Configuración del transportador SMTP para el envío de correos electrónicos.
*/
const mailer_transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: ENVIRONMENT.GMAIL_USERNAME,
        pass: ENVIRONMENT.GMAIL_PASSWORD,
    }
})

export default mailer_transport