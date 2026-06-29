import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { register } from '../../services/authService.js';
import loginVideo from '../../assets/login_animated_background.mp4';
import loginWave from '../../assets/login_wave.png';
import '../LoginScreen/LoginScreen.css';

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
            await register(email, password, username);
            
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
            <video src={loginVideo} poster={loginWave} className="login-video-bg" style={{ filter: 'hue-rotate(-20deg)' }} autoPlay loop muted playsInline />

            <div className="login-logo">
                <span style={{color: 'var(--accent-primary)'}}>🎵</span> MIB
            </div>

            <div className="login-modal">
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
                                placeholder="Username (e.g. JohnDoe)" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <input 
                                type="email" 
                                className="input-field" 
                                placeholder="Email address" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <input 
                                type="password" 
                                className="input-field" 
                                placeholder="Create a strong Password" 
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
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
                                </svg>
                                Sign up with Google
                            </button>
                            <button type="button" className="btn-social">
                                <svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                </svg>
                                Sign up with Apple
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
