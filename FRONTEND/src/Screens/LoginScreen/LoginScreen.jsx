import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router';
import { AuthContext } from '../../context/AuthContext';
import { login } from '../../services/authService';
import { jwtDecode } from 'jwt-decode';
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
            const response = await login(email, password);
            
            const token = response.data.access_token;
            const decodedUser = jwtDecode(token);

            loginUser(token, decodedUser);

            if (decodedUser.is_profile_complete === false) {
                navigate('/setup-profile');
            } else {
                navigate('/home');
            }
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <video src={loginVideo} poster={loginWave} className="login-video-bg" autoPlay loop muted playsInline />

            <div className="login-modal">
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
                            <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>

                        <div className="social-login-container">
                            <button type="button" className="btn-social" onClick={() => alert('Próximamente: Iniciar sesión con Google')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
                                </svg>
                                Continue with Google
                            </button>
                            <button type="button" className="btn-social" onClick={() => alert('Próximamente: Iniciar sesión con Apple')}>
                                <svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
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
