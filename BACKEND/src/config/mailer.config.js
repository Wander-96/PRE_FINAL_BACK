import nodemailer from 'nodemailer';
import ENVIRONMENT from './environment.config.js'

/*
Creamos un "transportador" de emails usando Gmail y 
las credenciales secretas que guardamos en nuestro archivo .env
*/

const mailer_transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ENVIRONMENT.GMAIL_USERNAME,
        pass: ENVIRONMENT.GMAIL_PASSWORD,
    }
})

export default mailer_transport