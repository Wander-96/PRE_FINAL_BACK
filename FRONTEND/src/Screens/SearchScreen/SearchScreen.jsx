import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { globalSearch } from '../../services/searchService.js';
import { Navbar } from '../../components/layout/Navbar/Navbar.jsx';
import { Sidebar } from '../../components/layout/Sidebar/Sidebar.jsx';
import { PostCard } from '../../components/feed/PostCard/PostCard.jsx';
import ENVIRONMENT from '../../config/environment.js';
import './SearchScreen.css';

export const SearchScreen = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);

    // Filter tabs: 'all', 'users', 'posts'
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!query || query.length < 2) return;
        
        const fetchResults = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await globalSearch(query, 'all', 1, 20);
                setUsers(response.data.users || []);
                setPosts(response.data.posts || []);
            } catch (err) {
                setError(err.message || 'Error al buscar');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (!query || query.length < 2) {
        return (
            <div className="layout-container">
                <Navbar />
                <div className="layout-content">
                    <Sidebar />
                    <main className="main-content search-main">
                        <div className="search-header">
                            <h2>Búsqueda</h2>
                            <p className="text-muted">Ingresa al menos 2 caracteres para buscar.</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-container">
            <Navbar />
            <div className="layout-content">
                <Sidebar />
                <main className="main-content search-main">
                    <div className="search-header">
                        <h2>Resultados para "{query}"</h2>
                    </div>

                    <div className="search-tabs">
                        <button className={`search-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Todo</button>
                        <button className={`search-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Usuarios ({users.length})</button>
                        <button className={`search-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Publicaciones ({posts.length})</button>
                    </div>

                    <div className="search-results">
                        {loading ? (
                            <div className="loading-spinner">Buscando...</div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : (
                            <>
                                {/* Usuarios */}
                                {(activeTab === 'all' || activeTab === 'users') && (
                                    <div className="search-section">
                                        <h3>Músicos Encontrados</h3>
                                        {users.length > 0 ? (
                                            <div className="connections-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px', marginTop: '16px' }}>
                                                {users.map(user => (
                                                    <div 
                                                        key={user._id} 
                                                        className="connection-item"
                                                        onClick={() => navigate(`/profile/${user._id}`)}
                                                        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#1a1525', padding: '16px', borderRadius: '12px' }}
                                                    >
                                                        <img 
                                                            src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${ENVIRONMENT.URL_API}/${user.avatar.replace(/\\/g, '/')}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff`} 
                                                            alt={user.name} 
                                                            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px' }}
                                                        />
                                                        <span className="connection-name" style={{ fontWeight: '500', color: '#e2e8f0', textAlign: 'center', fontSize: '0.9rem' }}>{user.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted">No se encontraron músicos con ese término.</p>
                                        )}
                                    </div>
                                )}

                                {/* Publicaciones */}
                                {(activeTab === 'all' || activeTab === 'posts') && (
                                    <div className="search-section" style={{ marginTop: '32px' }}>
                                        <h3>Publicaciones Encontradas</h3>
                                        {posts.length > 0 ? (
                                            <div className="search-posts-list">
                                                {posts.map(post => (
                                                    <PostCard key={post._id} post={post} />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted">No se encontraron publicaciones con ese término.</p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};
