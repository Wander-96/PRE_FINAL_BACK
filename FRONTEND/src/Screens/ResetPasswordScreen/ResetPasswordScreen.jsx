import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { resetPassword } from '../../services/authService.js';
import '../LoginScreen/LoginScreen.css';

export const ResetPasswordScreen = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // El backend lo envía como ?token=...
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Enlace inválido o expirado. Por favor, solicita uno nuevo.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await resetPassword(token, password);
            setMessage(response.message || 'Contraseña actualizada exitosamente.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Ocurrió un error al restablecer tu contraseña.');
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
                        <h2>Nueva Contraseña</h2>
                        <p>Crea una nueva contraseña para tu cuenta</p>
                    </div>

                    {error && <div className="auth-error-message" style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                    {message && <div className="auth-success-message" style={{ color: '#10B981', marginBottom: '1rem', textAlign: 'center' }}>{message} Serás redirigido al login...</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Nueva contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={!token || !!message}
                            />
                        </div>
                        
                        <div className="input-group">
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Confirmar contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={!token || !!message}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isLoading || !token || !!message}
                            style={{ marginTop: '1rem' }}
                        >
                            {isLoading ? 'Actualizando...' : 'Restablecer contraseña'}
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
