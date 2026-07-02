import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../../context/AuthContext.jsx';
import { login } from '../../services/authService.js';
import loginVideo from '../../assets/login_animated_background.mp4';
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
            // Autenticación en backend.
            const response = await login(email, password);

            // Extracción de payload.
            const token = response.data.access_token;
            const userData = response.data.user_info;

            // Actualización de estado global.
            loginUser(token, userData);

            // Redirección al feed.
            navigate('/home');
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Video de fondo. */}
            <video src={loginVideo} poster={loginWave} className="login-video-bg" autoPlay loop muted playsInline />



            {/* Logo placeholder. */}


            {/* Contenedor modal principal. */}
            <div className="login-modal">
                {/* Formulario derecho. */}
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
                                placeholder="Email or username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Password"
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
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
                                </svg>
                                Continue with Google
                            </button>
                            <button type="button" className="btn-social">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.365,21.439c-1.396,1.405-2.529,1.49-3.906,0.762c-1.425-0.75-2.909-0.742-4.305-0.006c-1.312,0.686-2.476,0.654-3.793-0.756C-1.895,11.53,1.939,1.155,9.255,2.152c1.789,0.24,3.284,1.171,4.24,1.171c0.976,0,2.697-1.127,4.821-0.963c1.791,0.076,3.41,0.744,4.421,2.228c-3.842,2.215-3.218,7.397,0.56,8.871C22.253,16.294,18.826,23.865,16.365,21.439z M14.675,6.671c-0.276-2.518,1.91-4.733,4.408-5.008C19.467,4.321,17.168,6.861,14.675,6.671z" />
                                </svg>
                                Continue with Apple
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
