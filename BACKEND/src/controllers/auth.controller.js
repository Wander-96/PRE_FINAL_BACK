import ENVIRONMENT from "../config/environment.config.js";
import mailer_transport from "../config/mailer.config.js";
import ServerError from "../helpers/serverError.helper.js"; // Nuestro helper personalizado
import userRepository from "../repositories/user.repository.js"; // El operario de BD
import bcrypt from 'bcrypt' // Para encriptar contraseñas
import jwt from 'jsonwebtoken' // Para crear tokens de sesión (las "llaves" del usuario)

class AuthController {

    /* ====================================================================
       1. REGISTRO DE USUARIO
       ==================================================================== */
    async register(req, res) {
        try {
            // Extraemos los datos que nos envía el usuario desde el frontend
            const { name, email, password } = req.body;

            // VALIDACIONES DE NEGOCIO:
            // Si algo falla, lanzamos nuestro 'ServerError' con un código 400 (Bad Request)
            if (!name || name.length <= 2) {
                throw new ServerError("Nombre debe ser mayor a 2 caracteres", 400)
            }
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                throw new ServerError("Email inválido", 400)
            }
            if (!password || password.length < 6) {
                throw new ServerError("Password debe tener al menos 6 caracteres", 400)
            }

            // Llamamos al Repositorio para ver si el correo ya existe
            const existingUser = await userRepository.getByEmail(email);
            if (existingUser) {
                throw new ServerError("El email ya está registrado", 400)
            }

            // Encriptamos la contraseña para no guardarla en texto plano
            const hashed_password = await bcrypt.hash(password, 12);

            // Le pedimos al Repositorio que construya el usuario en la BD
            const newUser = await userRepository.create(name, email, hashed_password);

            // Creamos un token especial, solo para enviarlo por correo
            const verification_token = jwt.sign(
                { email: email },
                ENVIRONMENT.JWT_SECRET
            )

            // Enviamos el correo con Nodemailer usando nuestro enlace y token
            await mailer_transport.sendMail({
                to: email,
                from: ENVIRONMENT.GMAIL_USERNAME,
                subject: "Verifica tu mail",
                html: `
                    <h1>Bienvenido a SLACK</h1>
                    <a href='${ENVIRONMENT.URL_BACKEND}/api/auth/verify-email?verification_token=${verification_token}'>Click aqui</a> para verificar tu cuenta
                `
            })

            // Si llegamos hasta aquí, todo fue un éxito (201: Created)
            return res.status(201).json({
                message: "Usuario registrado con éxito",
                ok: true,
                status: 201,
                data: {
                    user: {
                        id: newUser._id,
                        name: newUser.name,
                        email: newUser.email
                    }
                }
            });

        } catch (error) {
            // MANEJO DE ERRORES INTELIGENTE:
            // Si el error es de tipo 'ServerError' (los que nosotros lanzamos), mostramos ese error
            if (error instanceof ServerError) {
                return res.status(error.status).json({
                    message: error.message,
                    ok: false,
                    status: error.status
                })
            } else {
                // Si es un error desconocido (ej. se cayó la base de datos), devolvemos 500
                console.error('Error critico:', error);
                return res.status(500).json({
                    message: "Error interno del servidor",
                    ok: false,
                    status: 500
                });
            }
        }
    }

    /* ====================================================================
       2. VERIFICACIÓN DE EMAIL
       ==================================================================== */
    async verifyEmail(req, res) {
        try {
            // Obtenemos el token de la URL (ej. ?verification_token=12345)
            const { verification_token } = req.query;

            if (!verification_token) {
                throw new ServerError("Falta token de verificación", 400);
            }

            // Decodificamos el token con nuestra palabra secreta para saber de quién es
            const payload = jwt.verify(verification_token, ENVIRONMENT.JWT_SECRET)
            const { email } = payload

            const user = await userRepository.getByEmail(email);
            if (!user) {
                throw new ServerError("Usuario no encontrado", 404);
            }
            if (user.email_verified) {
                throw new ServerError("Este email ya ha sido verificado", 400);
            }

            // Actualizamos al usuario para marcarlo como verificado
            await userRepository.updateById(user._id, { email_verified: true });

            return res.status(200).json({
                ok: true,
                status: 200,
                message: "Email verificado correctamente. ¡Ya puedes usar tu cuenta!"
            });

        }
        catch (error) {
            // Manejamos específicamente los errores si el token expiró o fue hackeado
            if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.NotBeforeError || error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ message: "Token invalido", ok: false, status: 401 })
            }
            else if (error instanceof ServerError) {
                return res.status(error.status).json({ message: error.message, ok: false, status: error.status })
            }
            else {
                console.error('Error critico:', error);
                return res.status(500).json({ message: "Error interno del servidor", ok: false, status: 500 });
            }
        }
    }

    /* ====================================================================
       3. INICIO DE SESIÓN (LOGIN)
       ==================================================================== */
    async login(request, response) {
        try {
            const { email, password } = request.body

            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                throw new ServerError("Email inválido", 400)
            }
            if (!password || password.length < 6) {
                throw new ServerError("Contraseña invalida", 400)
            }

            const user_found = await userRepository.getByEmail(email)
            if (!user_found) {
                throw new ServerError("Usuario no registrado", 404)
            }
            if (!user_found.email_verified) {
                throw new ServerError("Usuario con verificacion de mail pendiente", 401)
            }

            // Bcrypt compara la contraseña de texto plano con la encriptada en la DB
            const is_same_password = await bcrypt.compare(password, user_found.password)
            if (!is_same_password) {
                throw new ServerError("Credenciales invalidas", 401)
            }

            // Creamos el perfil que irá guardado dentro de la "llave" (token)
            const profile_info = {
                name: user_found.name,
                email: user_found.email,
                id: user_found._id,
                created_at: user_found.created_at
            }

            // Creamos la llave maestra para que el usuario navegue sin volver a poner contraseña
            const access_token = jwt.sign(
                profile_info,
                ENVIRONMENT.JWT_SECRET
            )

            return response.status(200).json({
                ok: true,
                status: 200,
                message: 'Usuario autentificado exitosamente',
                data: { access_token }
            })
        }
        catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({ message: error.message, ok: false, status: error.status })
            }
            else {
                console.error('Error critico:', error);
                return response.status(500).json({ message: "Error interno del servidor", ok: false, status: 500 });
            }
        }
    }

    /* --- 4. SOLICITUD RESTABLECER CONTRASEÑA --- */
    async resetPasswordRequest(request, response) {
        try {
            const { email } = request.body;

            if (!email) {
                throw new ServerError("El email es obligatorio", 400);
            }

            const user = await userRepository.getByEmail(email);

            if (!user) {
                return response.status(200).json({
                    ok: true,
                    status: 200,
                    message: "En caso de que tengas una cuenta asociada a este correo te enviaremos instrucciones para restablecer tu contraseña"
                });
            }

            const secret_key = ENVIRONMENT.JWT_SECRET + user.password;

            const token = jwt.sign(
                { email: user.email, id: user._id },
                secret_key,
                { expiresIn: '15m' } 
            );

            const reset_link = `${ENVIRONMENT.URL_FRONTEND}/reset-password?token=${token}`;

            await mailer_transport.sendMail({
                from: 'Tu App <no-reply@tuapp.com>',
                to: user.email,
                subject: 'Restablece tu contraseña',
                html: `
                        <h1>Restablecimiento de Contraseña</h1>
                        <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace de abajo para continuar:</p>
                        <a href="${reset_link}">Restablecer mi contraseña</a>
                        <p>Este enlace expirará en 15 minutos. Si tú no solicitaste esto, puedes ignorar este correo sin problemas.</p>
                    `
            });

            return response.status(200).json({
                ok: true,
                status: 200,
                message: "En caso de que tengas una cuenta asociada a este correo te enviaremos instrucciones para restablecer tu contraseña"
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({ message: error.message, ok: false, status: error.status })
            } else {
                console.error('Error critico:', error);
                return response.status(500).json({ message: "Error interno del servidor", ok: false, status: 500 });
            }
        }
    }

    async resetPasswordConfirm(request, response) {
        try {
            const auth_header = request.headers.authorization

            if (!auth_header) {
                throw new ServerError('Falta header de autentificacion', 401)
            }

            const reset_token = auth_header.split(' ')[1]

            if (!reset_token) {
                throw new ServerError('Falta el token de autorizacion', 401)
            }

            const { email } = jwt.decode(reset_token)
            const user = await userRepository.getByEmail(email)
            if (!user) {
                throw new ServerError("Usuario no encontrado", 404);
            }

            const secret_key = ENVIRONMENT.JWT_SECRET + user.password;
            const decoded = jwt.verify(reset_token, secret_key);

            const { newPassword } = request.body;

            if (!newPassword || newPassword.length < 6) {
                throw new ServerError("Contraseña invalida", 400);
            }

            const new_password_hashed = await bcrypt.hash(newPassword, 10);
            await userRepository.updateById(user._id, { password: new_password_hashed });

            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Contraseña restablecida exitosamente"
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({ message: error.message, ok: false, status: error.status })
            } else {
                console.error('Error critico:', error);
                return response.status(500).json({ message: "Error interno del servidor", ok: false, status: 500 });
            }
        }
    }
}

// Singleton
const authController = new AuthController();
export default authController
