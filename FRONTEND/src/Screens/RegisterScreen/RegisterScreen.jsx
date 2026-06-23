import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { register } from '../../services/authService';
import loginWave from '../../assets/login_wave.png'; // Reutilizamos la onda abstracta para mantener la estética
import '../LoginScreen/LoginScreen.css'; // Reutilizamos la base del login

export const RegisterScreen = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Llamamos al servicio de registro
            await register(email, password, username);
            
            // Si el registro fue exitoso
            setSuccessMessage('Account created successfully! Redirecting to login...');
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Error al crear la cuenta');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Logo */}
            <div className="login-logo">
                <span style={{color: 'var(--accent-primary)'}}>🎵</span> MIB
            </div>

            <div className="login-modal">
                
                {/* Lado Izquierdo: Imagen */}
                <div className="login-image-side">
                    <img src={loginWave} alt="Sound Wave" className="login-image" style={{ filter: 'hue-rotate(-20deg)' }} />
                    <div className="login-image-overlay">
                        <h2>Join the stage</h2>
                        <p>Connect with musicians worldwide • Zero friction</p>
                    </div>
                </div>

                {/* Lado Derecho: Formulario */}
                <div className="login-form-side">
                    <div className="login-header">
                        <h1>Create your Account</h1>
                        <p>Set up your profile to start collaborating, sharing your sound, and finding gig opportunities.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        
                        {error && <div className="error-message">{error}</div>}
                        {successMessage && <div className="success-message">{successMessage}</div>}

                        <div className="input-group">
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="👤 Username (e.g. JohnDoe)" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <input 
                                type="email" 
                                className="input-field" 
                                placeholder="📧 Email address" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <input 
                                type="password" 
                                className="input-field" 
                                placeholder="🔒 Create a strong Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>

                        <div className="social-login-container">
                            <button type="button" className="btn-social">
                                🇬 Sign up with Google
                            </button>
                        </div>
                    </form>

                    <div className="login-footer">
                        <span>Already have an account? <a href="/login">Sign In</a></span>
                        <span>By signing up you agree to our <a href="#">Terms of Service</a></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
