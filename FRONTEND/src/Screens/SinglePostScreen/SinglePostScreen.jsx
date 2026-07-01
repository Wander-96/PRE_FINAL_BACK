import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getPostById } from '../../services/postService.js';
import { PostCard } from '../../components/feed/PostCard/PostCard.jsx';
import { ArrowLeft } from 'lucide-react';
import './SinglePostScreen.css';

export const SinglePostScreen = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await getPostById(postId);
                setPost(response.data);
            } catch (err) {
                setError(err.message || 'Error al cargar la publicación');
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    const handlePostDeleted = () => {
        navigate('/home'); // Si se borra estando acá, lo mandamos al home
    };

    return (
        <div className="single-post-main" style={{ width: '100%', padding: '24px' }}>
            <div className="single-post-header">
                <button className="back-btn" onClick={() => navigate('/home')}>
                    <ArrowLeft size={20} /> Volver al Inicio
                </button>
                <h2>Publicación</h2>
            </div>

            <div className="single-post-container">
                {loading ? (
                    <div className="loading-spinner">Cargando publicación...</div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button className="btn-primary" onClick={() => navigate('/home')}>Ir al Inicio</button>
                    </div>
                ) : post ? (
                    <PostCard post={post} onPostDeleted={handlePostDeleted} />
                ) : (
                    <div className="error-message">Publicación no encontrada.</div>
                )}
            </div>
        </div>
    );
};
