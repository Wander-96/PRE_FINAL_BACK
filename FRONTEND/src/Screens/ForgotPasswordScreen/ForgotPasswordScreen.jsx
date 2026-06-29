import React, { useState } from 'react';
import { Link } from 'react-router';
import { forgotPassword } from '../../services/authService.js';
import '../LoginScreen/LoginScreen.css'; // Reutilizamos los estilos del login

export const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await forgotPassword(email);
            setMessage(response.message || 'Te hemos enviado un correo con las instrucciones.');
        } catch (err) {
            setError(err.message || 'Ocurrió un error al procesar tu solicitud.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="auth-bg-video"
            >
                <source src="/assets/login_animated_background.mp4" type="video/mp4" />
            </video>

            <div className="auth-content">
                <div className="auth-box">
                    <div className="auth-header">
                        <img src="/assets/login_wave.png" alt="Wave" className="auth-wave" />
                        <h2>Recuperar Contraseña</h2>
                        <p>Ingresa tu correo para recibir las instrucciones</p>
                    </div>

                    {error && <div className="auth-error-message" style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                    {message && <div className="auth-success-message" style={{ color: '#10B981', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <input
                                type="email"
                                className="input-field"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isLoading}
                            style={{ marginTop: '1rem' }}
                        >
                            {isLoading ? 'Enviando...' : 'Enviar correo'}
                        </button>
                    </form>

                    <div className="login-footer" style={{ marginTop: '2rem' }}>
                        <span>¿Recordaste tu contraseña? <Link to="/login">Inicia sesión</Link></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
