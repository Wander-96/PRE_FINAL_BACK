import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AuthContext } from '../../context/AuthContext';
import { getPostsByUser } from '../../services/postService';
import { CreatePostWidget } from '../../components/feed/CreatePostWidget/CreatePostWidget';
import { PostCard } from '../../components/feed/PostCard/PostCard';
import { PostDetailModal } from '../../components/feed/PostDetailModal/PostDetailModal';
import { MapPin, Briefcase, Info, Link2, Music, Headphones, Globe, Calendar, Edit2, Search, Users, Camera, MessageCircle } from 'lucide-react';
import { createOrGetConversation } from '../../services/messageService';
import ENVIRONMENT from '../../config/environment';
import './ProfileScreen.css';

// SVG Icons
const InstagramIcon = ({ color = '#E1306C', size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const SpotifyIcon = ({ color = '#1DB954', size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" color={color}>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.44-.48.18-1.02-.06-1.141-.54-.18-.48.06-1.02.54-1.14 4.32-1.26 9.72-.6 13.5 1.62.42.18.6.84.302 1.2zM19.08 10.5c-3.96-2.34-10.44-2.58-14.22-1.44-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.32-1.26 11.52-1.02 16.02 1.62.54.3.72 1.02.42 1.56-.24.54-.96.72-1.56.36z"/>
  </svg>
);

const SoundcloudIcon = ({ color = '#ff5500', size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" color={color}>
    <path d="M11.53 10.37c-.15 0-.29.02-.42.06v6.07h.84v-6.07c-.13-.04-.27-.06-.42-.06zm-1.89.47c-.14 0-.27.02-.4.07v5.59h.8v-5.59c-.13-.05-.26-.07-.4-.07zm-1.88.66c-.13 0-.25.02-.37.07v4.86h.74v-4.86c-.12-.05-.24-.07-.37-.07zm-1.86.8c-.12 0-.23.02-.33.08v3.97h.67v-3.97c-.1-.06-.21-.08-.34-.08zm-1.83 1.13c-.11 0-.22.02-.3.08v2.62h.61v-2.62c-.08-.06-.19-.08-.31-.08zm-1.74 1.34c-.08 0-.16.03-.22.07v1.17h.45v-1.17c-.06-.04-.14-.07-.23-.07zM24 13.56c0-1.8-1.48-3.26-3.29-3.26-.26 0-.52.03-.77.08-.66-1.51-2.18-2.55-3.95-2.55-2.37 0-4.28 1.9-4.28 4.24v4.43h12.29c0 0 0-2.94 0-2.94zm-10.74 2.94h-.88V9.12c.28-.08.57-.13.88-.13v7.51z"/>
  </svg>
);

export const ProfileScreen = () => {
    const { user: currentUser, loginUser, token } = useContext(AuthContext);
    const { userId } = useParams();
    const navigate = useNavigate();

    // Self profile check
    const isOwnProfile = !userId || (currentUser && userId === currentUser.id);
    const targetUserId = userId || (currentUser ? currentUser.id : null);

    const [activeTab, setActiveTab] = useState('Publicaciones');
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileUser, setProfileUser] = useState(null); 

    // Inline Editing States
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const avatarInputRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMediaIndex, setModalMediaIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsModalOpen(false);
            }
        };
        if (isModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    // Temporary current user assignment for own profile
    useEffect(() => {
        if (isOwnProfile && currentUser) {
            setProfileUser(currentUser);
        }
    }, [isOwnProfile, currentUser, targetUserId]);

    const fetchUserPosts = async () => {
        if (!targetUserId) return;
        try {
            setIsLoading(true);
            const data = await getPostsByUser(targetUserId);
            const postsArray = Array.isArray(data.data) ? data.data : (data.data.docs || []);
            setPosts(postsArray);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserPosts();
    }, [targetUserId]);

    const handlePostCreated = (newPost) => {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
    };

    const handlePostDeleted = (deletedPostId) => {
        setPosts((prevPosts) => prevPosts.filter(p => p._id !== deletedPostId));
    };

    const handlePostUpdated = (updatedPost) => {
        setPosts((prevPosts) => prevPosts.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    const handleSaveInlineEdit = async (field) => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            
            if (field === 'social_links') {
                const links = {
                    instagram: profileUser.social_links?.instagram || '',
                    spotify: profileUser.social_links?.spotify || '',
                    soundcloud: profileUser.social_links?.soundcloud || '',
                    ...editValue
                };
                formData.append('social_links', JSON.stringify(links));
            } else {
                formData.append(field, editValue);
            }

            const response = await fetch(`${ENVIRONMENT.URL_API}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al guardar');

            const updatedUser = { ...currentUser, ...data.data };
            loginUser(token, updatedUser);
            
            if (isOwnProfile) {
                setProfileUser(updatedUser);
            }
            setEditingField(null);
        } catch (err) {
            console.error('Error guardando:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartChat = async () => {
        try {
            await createOrGetConversation(profileUser._id);
            alert('¡Chat creado con éxito! Puedes buscar la conversación en el mensajero flotante abajo a la derecha.');
        } catch (error) {
            console.error('Error al iniciar chat:', error);
            alert('No se pudo iniciar el chat.');
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch(`${ENVIRONMENT.URL_API}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al subir la imagen');

            const updatedUser = { ...currentUser, ...data.data };
            loginUser(token, updatedUser);
            setProfileUser(updatedUser);
        } catch (err) {
            console.error('Error al subir avatar:', err);
            // Podríamos setear un error global si lo deseas
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    if (!profileUser) return <div className="loading-profile">Cargando perfil...</div>;

    // Avatar setup
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=8b5cf6&color=fff`;
    const avatarUrl = profileUser.avatar 
        ? (profileUser.avatar.startsWith('http') ? profileUser.avatar : `${ENVIRONMENT.URL_API}/${profileUser.avatar.replace(/\\/g, '/')}`)
        : fallbackAvatar;

    const dummyConnections = [];

    // Aggregate media from all posts
    const allMedia = posts.reduce((acc, post) => {
        if (post.media && post.media.length > 0) {
            const mediaWithPost = post.media.map((m, index) => ({
                ...m,
                post: post,
                localIndex: index
            }));
            return acc.concat(mediaWithPost);
        }
        return acc;
    }, []);

    const openModal = (index) => {
        setModalMediaIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="profile-screen-container">
            <div className="profile-header">
                <div className="profile-cover">
                    <div className="cover-gradient"></div>
                </div>

                <div className="profile-info-bar">
                    <div className="profile-avatar-wrapper">
                        <img 
                            src={avatarUrl} 
                            alt="Avatar" 
                            className="profile-avatar-img" 
                            onError={(e) => { e.target.src = fallbackAvatar; }} 
                            style={isUploadingAvatar ? { opacity: 0.5 } : {}}
                        />
                        {isOwnProfile && (
                            <>
                                <button 
                                    className="btn-edit-avatar" 
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    title="Cambiar foto de perfil"
                                >
                                    <Camera size={20} />
                                </button>
                                <input 
                                    type="file" 
                                    ref={avatarInputRef}
                                    onChange={handleAvatarChange}
                                    accept="image/*" 
                                    style={{ display: 'none' }} 
                                />
                            </>
                        )}
                    </div>
                    
                    <div className="profile-name-section">
                        <h1>{profileUser.name} {profileUser.last_name || ''}</h1>
                        
                        <div className="header-bio-section">
                            <p className="header-bio-text">{profileUser.bio || 'Músico en MIB'}</p>
                            <p className="header-location-text">
                                {profileUser.country && `${profileUser.country} · `}
                                <span className="header-contact-info">Información de contacto</span>
                            </p>
                            
                            <div className="header-social-links">
                                {profileUser.social_links?.instagram && (
                                    <a href={profileUser.social_links.instagram} target="_blank" rel="noreferrer" title="Instagram">
                                        <InstagramIcon size={18} />
                                    </a>
                                )}
                                {profileUser.social_links?.spotify && (
                                    <a href={profileUser.social_links.spotify} target="_blank" rel="noreferrer" title="Spotify">
                                        <SpotifyIcon size={18} />
                                    </a>
                                )}
                                {profileUser.social_links?.soundcloud && (
                                    <a href={profileUser.social_links.soundcloud} target="_blank" rel="noreferrer" title="SoundCloud">
                                        <SoundcloudIcon size={18} />
                                    </a>
                                )}
                            </div>
                            <span className="connections-count">0 conexiones</span>
                        </div>
                    </div>

                    <div className="profile-actions-section">
                        {isOwnProfile ? (
                            <button className="btn-edit-profile" onClick={() => setActiveTab('Información')}>
                                <Edit2 size={16} /> Editar perfil
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-connect">Conectar</button>
                                <button className="btn-connect" onClick={handleStartChat} style={{ backgroundColor: 'var(--primary-color, #8b5cf6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MessageCircle size={16} /> Mensaje
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="profile-tabs">
                    {['Publicaciones', 'Información', 'Conexiones', 'Fotos'].map(tab => (
                        <div 
                            key={tab} 
                            className={`tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className={`profile-content-grid ${(activeTab === 'Información' || activeTab === 'Fotos') ? 'full-width' : ''}`}>
                
                {(activeTab === 'Publicaciones' || activeTab === 'Conexiones') && (
                    <div className="profile-left-col">
                        <div className="profile-card connections-card">
                            <div className="connections-header">
                                <h3>Conexiones</h3>
                                <button className="btn-text" onClick={() => setActiveTab('Conexiones')}>Ver todas las conexiones</button>
                            </div>
                            <p className="subtext">0 conexiones</p>
                            
                            {dummyConnections.length > 0 && (
                                <div className="connections-grid">
                                    {dummyConnections.map(conn => (
                                        <div key={conn.id} className="connection-item">
                                            <img src={conn.avatar} alt={conn.name} />
                                            <span className="connection-name">{conn.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="profile-right-col">
                    {activeTab === 'Publicaciones' && (
                        <>
                            {isOwnProfile && (
                                <div className="profile-create-post">
                                    <CreatePostWidget onPostCreated={handlePostCreated} />
                                </div>
                            )}

                            <div className="profile-card posts-filter-card">
                                <h3>Publicaciones</h3>
                                <div className="filter-buttons">
                                    <button className="btn-filter"><Info size={16}/> Filtros</button>
                                    <button className="btn-filter"><Info size={16}/> Administrar</button>
                                </div>
                            </div>

                            <div className="profile-feed">
                                {isLoading ? (
                                    <p className="loading-text">Cargando publicaciones...</p>
                                ) : error ? (
                                    <p className="error-message">{error}</p>
                                ) : posts.length === 0 ? (
                                    <div className="no-posts-card">
                                        <p>No hay publicaciones recientes.</p>
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <PostCard 
                                            key={post._id} 
                                            post={post} 
                                            onPostDeleted={handlePostDeleted}
                                            onPostUpdated={handlePostUpdated}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'Información' && (
                        <div className="profile-card info-tab-card">
                            <h3>Acerca de</h3>
                            
                            <ul className="bio-list">
                                {editingField === 'bio' ? (
                                    <li className="inline-edit-form">
                                        <textarea 
                                            className="inline-edit-input" 
                                            value={editValue} 
                                            onChange={e => setEditValue(e.target.value)} 
                                            rows={3} 
                                            autoFocus
                                        />
                                        <div className="inline-edit-actions">
                                            <button className="btn-cancel-inline" onClick={() => setEditingField(null)}>Cancelar</button>
                                            <button className="btn-save-inline" disabled={isSaving} onClick={() => handleSaveInlineEdit('bio')}>Guardar</button>
                                        </div>
                                    </li>
                                ) : (
                                    <li className="inline-edit-row">
                                        <div className="inline-edit-content" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <Info size={18} className="bio-icon" />
                                            <span>{profileUser.bio || "No hay información de biografía aún."}</span>
                                        </div>
                                        {isOwnProfile && (
                                            <button className="btn-inline-edit" onClick={() => { setEditingField('bio'); setEditValue(profileUser.bio || ''); }}>
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </li>
                                )}

                                {editingField === 'birth_date' ? (
                                    <li className="inline-edit-form">
                                        <input 
                                            type="date" 
                                            className="inline-edit-input" 
                                            value={editValue} 
                                            onChange={e => setEditValue(e.target.value)} 
                                        />
                                        <div className="inline-edit-actions">
                                            <button className="btn-cancel-inline" onClick={() => setEditingField(null)}>Cancelar</button>
                                            <button className="btn-save-inline" disabled={isSaving} onClick={() => handleSaveInlineEdit('birth_date')}>Guardar</button>
                                        </div>
                                    </li>
                                ) : (
                                    <li className="inline-edit-row">
                                        <div className="inline-edit-content" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <Calendar size={18} className="bio-icon" />
                                            <span>Fecha de nacimiento: <strong>{profileUser.birth_date ? new Date(profileUser.birth_date).toLocaleDateString() : 'No especificada'}</strong></span>
                                        </div>
                                        {isOwnProfile && (
                                            <button className="btn-inline-edit" onClick={() => { 
                                                setEditingField('birth_date'); 
                                                setEditValue(profileUser.birth_date ? new Date(profileUser.birth_date).toISOString().split('T')[0] : ''); 
                                            }}>
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </li>
                                )}

                                {editingField === 'social_links' ? (
                                    <li className="inline-edit-form">
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                            <InstagramIcon size={20} />
                                            <input className="inline-edit-input" placeholder="Instagram URL" value={editValue.instagram || ''} onChange={e => setEditValue({...editValue, instagram: e.target.value})} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                            <SpotifyIcon size={20} />
                                            <input className="inline-edit-input" placeholder="Spotify URL" value={editValue.spotify || ''} onChange={e => setEditValue({...editValue, spotify: e.target.value})} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                            <SoundcloudIcon size={20} />
                                            <input className="inline-edit-input" placeholder="Soundcloud URL" value={editValue.soundcloud || ''} onChange={e => setEditValue({...editValue, soundcloud: e.target.value})} />
                                        </div>
                                        <div className="inline-edit-actions">
                                            <button className="btn-cancel-inline" onClick={() => setEditingField(null)}>Cancelar</button>
                                            <button className="btn-save-inline" disabled={isSaving} onClick={() => handleSaveInlineEdit('social_links')}>Guardar</button>
                                        </div>
                                    </li>
                                ) : (
                                    <li className="inline-edit-row">
                                        <div className="inline-edit-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {(!profileUser.social_links?.instagram && !profileUser.social_links?.spotify && !profileUser.social_links?.soundcloud) && (
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}>
                                                    <Globe size={18} className="bio-icon" />
                                                    <span>Sin enlaces a redes sociales.</span>
                                                </div>
                                            )}
                                            {profileUser.social_links?.instagram && (
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <InstagramIcon size={18} />
                                                    <a href={profileUser.social_links.instagram} target="_blank" rel="noreferrer">Instagram</a>
                                                </div>
                                            )}
                                            {profileUser.social_links?.spotify && (
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <SpotifyIcon size={18} />
                                                    <a href={profileUser.social_links.spotify} target="_blank" rel="noreferrer">Spotify</a>
                                                </div>
                                            )}
                                            {profileUser.social_links?.soundcloud && (
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <SoundcloudIcon size={18} />
                                                    <a href={profileUser.social_links.soundcloud} target="_blank" rel="noreferrer">SoundCloud</a>
                                                </div>
                                            )}
                                        </div>
                                        {isOwnProfile && (
                                            <button className="btn-inline-edit" onClick={() => { 
                                                setEditingField('social_links'); 
                                                setEditValue({
                                                    instagram: profileUser.social_links?.instagram || '',
                                                    spotify: profileUser.social_links?.spotify || '',
                                                    soundcloud: profileUser.social_links?.soundcloud || ''
                                                }); 
                                            }}>
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    {activeTab === 'Conexiones' && (
                        <div className="profile-card connections-tab-card">
                            <h3>Conexiones (0)</h3>
                            <p className="text-muted">Aún no hay conexiones para mostrar.</p>
                        </div>
                    )}
                    {activeTab === 'Fotos' && (
                        <div className="profile-card photos-tab-card">
                            <h3>Fotos y Videos</h3>
                            <div className="photos-grid">
                                {allMedia.map((m, index) => (
                                    <div key={`media-${index}`} className="photo-item" onClick={() => openModal(index)} style={{ cursor: 'pointer' }}>
                                        {m.type === 'VIDEO' ? (
                                            <video src={m.url} className="photo-grid-img" muted />
                                        ) : (
                                            <img src={m.url} alt="Post media" className="photo-grid-img" />
                                        )}
                                    </div>
                                ))}
                                {allMedia.length === 0 && (
                                    <p className="text-muted" style={{gridColumn: '1 / -1'}}>No hay fotos o videos para mostrar.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && allMedia.length > 0 && (
                <PostDetailModal 
                    post={allMedia[modalMediaIndex].post}
                    mediaList={allMedia}
                    initialMediaIndex={modalMediaIndex}
                    onClose={closeModal}
                    onUpdatePost={handlePostUpdated}
                />
            )}
        </div>
    );
};
