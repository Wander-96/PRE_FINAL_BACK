import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toggleLike } from '../../../services/postService';
import { getCommentsByPost, createComment, deleteComment, updateComment } from '../../../services/commentService';
import { Heart, MessageCircle, Send, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { CommentText } from '../PostCard/PostCard'; // Will export this from PostCard
import './PostDetailModal.css';

export const PostDetailModal = ({ post, mediaList, initialMediaIndex = 0, onClose, onUpdatePost }) => {
    const { user } = useContext(AuthContext);
    const [modalMediaIndex, setModalMediaIndex] = useState(initialMediaIndex);
    
    const activeMediaList = mediaList || post?.media || [];
    const currentPost = activeMediaList[modalMediaIndex]?.post || post;

    // Post State
    const [likesCount, setLikesCount] = useState(currentPost?.likesCount || 0);
    const [isLiked, setIsLiked] = useState(false); // Can be synchronized later
    
    // Comments State
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');

    const author = currentPost?.fk_id_user;
    const authorName = author?.name || 'Musician';
    const authorInitial = authorName.charAt(0).toUpperCase();
    const time = currentPost?.createdAt ? new Date(currentPost.createdAt).toLocaleString() : '';

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            // No navegar si el foco está en un input o textarea (para poder escribir)
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                if (e.key === 'Escape') {
                    // Permitir escape para desenfocar o salir
                    e.target.blur();
                }
                return;
            }

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowRight') {
                if (activeMediaList.length > 1) {
                    setModalMediaIndex((prev) => (prev + 1) % activeMediaList.length);
                }
            } else if (e.key === 'ArrowLeft') {
                if (activeMediaList.length > 1) {
                    setModalMediaIndex((prev) => (prev - 1 + activeMediaList.length) % activeMediaList.length);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, activeMediaList.length]);

    // Sync likesCount and load comments when currentPost changes
    useEffect(() => {
        if (currentPost) {
            setLikesCount(currentPost.likesCount || 0);
            loadComments();
        }
    }, [currentPost?._id]);

    const loadComments = async () => {
        if (!currentPost?._id) return;
        try {
            setLoadingComments(true);
            const data = await getCommentsByPost(currentPost._id);
            setComments(data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleLike = async () => {
        try {
            const wasLiked = isLiked;
            setIsLiked(!wasLiked);
            const newLikesCount = wasLiked ? Math.max(0, likesCount - 1) : likesCount + 1;
            setLikesCount(newLikesCount);
            
            await toggleLike(currentPost._id);
            if (onUpdatePost) onUpdatePost({ ...currentPost, likesCount: newLikesCount });
        } catch (error) {
            setIsLiked(isLiked);
            setLikesCount(likesCount);
            console.error(error);
        }
    };

    const handlePostComment = async (e) => {
        if (e) e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const data = await createComment(currentPost._id, newComment);
            const addedComment = {
                ...data.data,
                fk_id_user: { _id: user.id, name: user.name, avatar: user.avatar }
            };
            const updatedComments = [addedComment, ...comments];
            setComments(updatedComments);
            setNewComment('');
            if (onUpdatePost) onUpdatePost({ ...currentPost, commentsCount: updatedComments.length });
        } catch (error) {
            console.error(error);
        }
    };

    const handleKeyDownComment = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePostComment();
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm("¿Borrar este comentario?")) {
            try {
                await deleteComment(commentId);
                const updatedComments = comments.filter(c => c._id !== commentId);
                setComments(updatedComments);
                if (onUpdatePost) onUpdatePost({ ...currentPost, commentsCount: updatedComments.length });
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleUpdateComment = async (commentId) => {
        if (!editCommentText.trim()) return;
        try {
            await updateComment(commentId, editCommentText);
            setComments(comments.map(c => c._id === commentId ? { ...c, content: editCommentText } : c));
            setEditingCommentId(null);
        } catch (error) {
            console.error(error);
        }
    };

    const nextMedia = (e) => {
        if (e) e.stopPropagation();
        setModalMediaIndex((prev) => (prev + 1) % activeMediaList.length);
    };

    const prevMedia = (e) => {
        if (e) e.stopPropagation();
        setModalMediaIndex((prev) => (prev - 1 + activeMediaList.length) % activeMediaList.length);
    };

    // Formatear el contenido de la publicación (links y demás)
    const formatContent = (text) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="post-link">{part}</a>;
            }
            return part;
        });
    };

    return (
        <div className="pdm-overlay" onClick={onClose}>
            <button className="pdm-close-btn" onClick={onClose}><X size={28} /></button>
            
            <div className="pdm-container" onClick={e => e.stopPropagation()}>
                
                {/* Media Section (Left) */}
                <div className="pdm-media-section">
                    {activeMediaList.length > 1 && (
                        <button className="pdm-nav-btn prev" onClick={prevMedia}><ChevronLeft size={36} /></button>
                    )}
                    
                    <div className="pdm-media-content">
                        {activeMediaList[modalMediaIndex]?.type === 'VIDEO' ? (
                            <video src={activeMediaList[modalMediaIndex].url} controls autoPlay />
                        ) : (
                            <img src={activeMediaList[modalMediaIndex]?.url} alt="Post media" />
                        )}
                    </div>

                    {activeMediaList.length > 1 && (
                        <button className="pdm-nav-btn next" onClick={nextMedia}><ChevronRight size={36} /></button>
                    )}
                </div>

                {/* Sidebar Section (Right) */}
                <div className="pdm-sidebar">
                    <div className="pdm-header">
                        <Link to={`/profile/${author?._id}`} className="pdm-avatar" style={{ textDecoration: 'none', color: 'inherit' }}>{authorInitial}</Link>
                        <div className="pdm-meta">
                            <Link to={`/profile/${author?._id}`} className="pdm-author" style={{ textDecoration: 'none', color: 'inherit' }}>{authorName}</Link>
                            <span className="pdm-time">{time}</span>
                        </div>
                    </div>

                    <div className="pdm-body-scroll">
                        <div className="pdm-post-content">
                            {formatContent(currentPost?.content)}
                        </div>

                        <div className="pdm-stats">
                            <span><Heart size={14} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} /> {likesCount}</span>
                            <span>{comments.length} comentarios</span>
                        </div>

                        <div className="pdm-actions">
                            <button className={`btn-interaction ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                                <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} /> 
                                Me gusta
                            </button>
                            <button className="btn-interaction" onClick={() => document.getElementById('pdm-comment-input').focus()}>
                                <MessageCircle size={18} /> Comentar
                            </button>
                        </div>

                        <div className="pdm-comments-list">
                            {loadingComments ? (
                                <div className="comments-loading">Cargando comentarios...</div>
                            ) : (
                                comments.map(comment => {
                                    const canEditComment = (Date.now() - new Date(comment.createdAt).getTime()) <= 900000;
                                    return (
                                        <div key={comment._id} className="comment-item pdm-comment-item">
                                            <Link to={`/profile/${comment.fk_id_user?._id}`} className="comment-avatar" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                {comment.fk_id_user?.name?.charAt(0).toUpperCase()}
                                            </Link>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <Link to={`/profile/${comment.fk_id_user?._id}`} className="comment-author" style={{ textDecoration: 'none', color: 'inherit' }}>{comment.fk_id_user?.name}</Link>
                                                    <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                {editingCommentId === comment._id ? (
                                                    <div className="comment-edit-form">
                                                        <textarea 
                                                            value={editCommentText} 
                                                            onChange={(e) => setEditCommentText(e.target.value)} 
                                                            className="comment-edit-input"
                                                            rows={2}
                                                        />
                                                        <div className="post-edit-actions" style={{ marginTop: '4px' }}>
                                                            <button className="btn-cancel" onClick={() => setEditingCommentId(null)}>Cancelar</button>
                                                            <button className="btn-save" onClick={() => handleUpdateComment(comment._id)}>Guardar</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <CommentText text={comment.content} />
                                                )}
                                            </div>
                                            {user && user.id === comment.fk_id_user?._id && (
                                                <div className="comment-actions">
                                                    {canEditComment && (
                                                        <button className="btn-action-comment edit" onClick={() => { setEditingCommentId(comment._id); setEditCommentText(comment.content); }}>
                                                            <Edit2 size={14} />
                                                        </button>
                                                    )}
                                                    <button className="btn-action-comment delete" onClick={() => handleDeleteComment(comment._id)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                            {comments.length === 0 && !loadingComments && (
                                <div className="no-comments pdm-no-comments">Sé el primero en comentar.</div>
                            )}
                        </div>
                    </div>

                    <div className="pdm-comment-input-section">
                        <form className="comment-form pdm-form" onSubmit={handlePostComment}>
                            <textarea 
                                id="pdm-comment-input"
                                placeholder="Escribe un comentario..." 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={handleKeyDownComment}
                                className="comment-input"
                                rows={1}
                            />
                            <button type="submit" className="btn-comment-submit" disabled={!newComment.trim()}>
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
