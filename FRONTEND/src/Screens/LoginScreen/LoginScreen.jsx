import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../../context/AuthContext';
import { login } from '../../services/authService';
import loginWave from '../../assets/login_wave.png';
import './LoginScreen.css';

export const LoginScreen = () => {
    const navigate = useNavigate();
    const { loginUser } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Llamamos al servicio (que apunta a nuestro Backend)
            const response = await login(email, password);
            
            // Si funciona, guardamos el token y la info en el Context (cerebro)
            loginUser(response.token, response.user);
            
            // Redirigimos al muro
            navigate('/home');
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Logo de la aplicación (Arriba a la izquierda) */}
            <div className="login-logo">
                <span style={{color: 'var(--accent-primary)'}}>🎵</span> MIB
            </div>

            {/* Caja modal central */}
            <div className="login-modal">
                
                {/* Lado Izquierdo: Imagen generada por IA */}
                <div className="login-image-side">
                    <img src={loginWave} alt="Sound Wave" className="login-image" />
                    <div className="login-image-overlay">
                        <h2>Your sound, secured</h2>
                        <p>Encrypted artist data • Recommended 2FA <span className="badge-2fa">Enable 2FA</span></p>
                    </div>
                </div>

                {/* Lado Derecho: Formulario */}
                <div className="login-form-side">
                    <div className="login-header">
                        <h1>Welcome back to MIB</h1>
                        <p>We keep musician data private and secure. For maximum safety enable two-factor authentication.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        
                        {error && <div className="error-message">{error}</div>}

                        <div className="input-group">
                            <input 
                                type="email" 
                                className="input-field" 
                                placeholder="📧 Email or username" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <input 
                                type="password" 
                                className="input-field" 
                                placeholder="🔒 Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" className="forgot-password">Forgot password?</a>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>

                        <div className="social-login-container">
                            <button type="button" className="btn-social">
                                🇬 Continue with Google
                            </button>
                            <button type="button" className="btn-social">
                                🍎 Continue with Apple
                            </button>
                        </div>
                    </form>

                    <div className="login-footer">
                        <span>New to MIB? <a href="/register">Create Account</a></span>
                        <span>By continuing you agree to our <a href="#">Privacy Policy</a></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
