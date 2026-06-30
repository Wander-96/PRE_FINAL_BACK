import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../../context/AuthContext.jsx';
import { LocationAutocomplete } from '../../components/feed/LocationAutocomplete/LocationAutocomplete.jsx';
import { Camera, Globe, Music, Headphones } from 'lucide-react';
import ENVIRONMENT from '../../config/environment.js';
import loginVideo from '../../assets/login_animated_background.mp4';
import loginWave from '../../assets/login_wave.png';
import './ProfileSetupScreen.css';

export const ProfileSetupScreen = () => {
    const { user, token, loginUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [name, setName] = useState(user?.name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [country, setCountry] = useState(user?.country || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [instagram, setInstagram] = useState(user?.social_links?.instagram || '');
    const [spotify, setSpotify] = useState(user?.social_links?.spotify || '');
    const [soundcloud, setSoundcloud] = useState(user?.social_links?.soundcloud || '');
    
    // Usar substring para evitar desplazamiento de huso horario en Date()
    const defaultDate = user?.birth_date ? user.birth_date.split('T')[0] : '';
    const [birthDate, setBirthDate] = useState(defaultDate);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Redirigir si no hay usuario logueado
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('last_name', lastName);
            formData.append('country', country);
            formData.append('bio', bio);
            if (birthDate) formData.append('birth_date', birthDate);
            formData.append('social_links', JSON.stringify({
                instagram,
                spotify,
                soundcloud
            }));

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const response = await fetch(`${ENVIRONMENT.URL_API}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // NO setear Content-Type, el navegador lo hace con el boundary al usar FormData
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error actualizando perfil');
            }

            // Actualizamos el contexto del usuario con la nueva información
            // Incluyendo is_profile_complete = true
            // Actualizamos el contexto del usuario con la nueva información
            // Incluyendo is_profile_complete = true
            const updatedUser = {
                ...user,
                name: data.data.name,
                last_name: data.data.last_name,
                country: data.data.country,
                bio: data.data.bio,
                birth_date: data.data.birth_date,
                social_links: data.data.social_links,
                avatar: data.data.avatar,
                is_profile_complete: true
            };

            loginUser(token, updatedUser);

            // Transición hacia el home
            navigate('/home');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="setup-container">
            <video src={loginVideo} poster={loginWave} className="setup-video-bg" autoPlay loop muted playsInline />

            <div className="setup-modal">
                <div className="setup-header">
                    <h1>Set Up Your Profile</h1>
                    <p>Complete your profile to connect with other musicians</p>
                </div>

                <form onSubmit={handleSubmit} className="setup-form">
                    {error && <div className="error-message">{error}</div>}

                    {/* AVATAR UPLOAD */}
                    <div className="avatar-upload-container">
                        <div 
                            className="avatar-preview-circle" 
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar preview" />
                            ) : (
                                <Camera size={32} className="avatar-placeholder-icon" />
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                        <span className="avatar-hint">Click to upload photo</span>
                    </div>

                    <div className="setup-grid">
                        <div className="input-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Email (Verified)</label>
                        <input
                            type="email"
                            className="input-field disabled"
                            value={user?.email || ''}
                            disabled
                        />
                    </div>

                    <div className="input-group">
                        <label>Location (Country/City)</label>
                        <LocationAutocomplete 
                            value={country} 
                            onChange={(val) => setCountry(val)} 
                        />
                    </div>

                    <div className="input-group">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            className="input-field"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            max={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    <div className="input-group">
                        <label>Biography</label>
                        <textarea
                            className="input-field bio-textarea"
                            placeholder="Tell everyone what you play and what you are looking for..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="social-links-section">
                        <label>Social Links (Optional)</label>
                        
                        <div className="social-input-wrapper">
                            <Globe size={18} className="social-icon instagram" />
                            <input 
                                type="url" 
                                className="input-field social" 
                                placeholder="Instagram profile URL"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                            />
                        </div>

                        <div className="social-input-wrapper">
                            <Headphones size={18} className="social-icon spotify" />
                            <input 
                                type="url" 
                                className="input-field social" 
                                placeholder="Spotify artist URL"
                                value={spotify}
                                onChange={(e) => setSpotify(e.target.value)}
                            />
                        </div>

                        <div className="social-input-wrapper">
                            <Music size={18} className="social-icon soundcloud" />
                            <input 
                                type="url" 
                                className="input-field social" 
                                placeholder="SoundCloud profile URL"
                                value={soundcloud}
                                onChange={(e) => setSoundcloud(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary setup-submit"
                        disabled={isLoading || !name || !lastName || !country}
                    >
                        {isLoading ? 'Saving...' : 'Complete Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};
