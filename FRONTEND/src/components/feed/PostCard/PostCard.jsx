import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toggleLike, deletePost, updatePost } from '../../../services/postService';
import { getCommentsByPost, createComment, deleteComment, updateComment } from '../../../services/commentService';
import { MoreVertical, Trash2, Heart, MessageCircle, Send, Edit2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './PostCard.css';

export const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useContext(AuthContext);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(false); // Asumiremos falso inicialmente hasta tener sync de DB
  const [showOptions, setShowOptions] = useState(false);
  
  // Edit Post state
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  // Media Modal (Lightbox) state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMediaIndex, setModalMediaIndex] = useState(0);
  const author = post.fk_id_user;
  const authorName = author?.name || 'Musician';
  const authorInitial = authorName.charAt(0).toUpperCase();
  const time = new Date(post.createdAt).toLocaleString();

  // Procesamos la multimedia
  const media = post.media || [];
  
  // Limite de 15 minutos para editar
  const canEditPost = (Date.now() - new Date(post.createdAt).getTime()) <= 900000;

  // Función para convertir URLs en enlaces clickeables y extraer ID de YouTube
  const formatContentAndExtractYT = (text) => {
    if (!text) return { content: null, ytId: null };
    
    let ytId = null;
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = text.match(ytRegex);
    if (match && match[1]) {
      ytId = match[1];
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    const formattedContent = parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="post-link">{part}</a>;
      }
      return part;
    });

    return { content: formattedContent, ytId };
  };

  const { content: formattedText, ytId } = formatContentAndExtractYT(post.content);

  const handleLike = async () => {
    try {
      // Optimistic UI update
      const wasLiked = isLiked;
      setIsLiked(!wasLiked);
      setLikesCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);
      
      await toggleLike(post._id);
    } catch (error) {
      // Revert if failed
      setIsLiked(isLiked);
      setLikesCount(post.likesCount);
      console.error(error);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")) {
      try {
        await deletePost(post._id);
        if (onPostDeleted) onPostDeleted(post._id);
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    }
  };

  const handleUpdatePost = async () => {
    try {
      await updatePost(post._id, editContent);
      post.content = editContent; // local update
      setIsEditingPost(false);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const toggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      loadComments();
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const data = await getCommentsByPost(post._id);
      setComments(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const data = await createComment(post._id, newComment);
      const addedComment = {
        ...data.data,
        fk_id_user: { _id: user.id, name: user.name, avatar: user.avatar }
      };
      setComments([addedComment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("¿Borrar este comentario?")) {
      try {
        await deleteComment(commentId);
        setComments(comments.filter(c => c._id !== commentId));
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

  const openModal = (index) => {
    setModalMediaIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const nextMedia = (e) => {
    e.stopPropagation();
    setModalMediaIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = (e) => {
    e.stopPropagation();
    setModalMediaIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const renderMediaGallery = () => {
    if (!media || media.length === 0) return null;

    const displayMedia = media.slice(0, 4);
    const layoutClass = `media-layout-${Math.min(media.length, 4)}`;
    
    return (
      <div className={`post-media-gallery ${layoutClass}`}>
        {displayMedia.map((item, index) => {
          const isLast = index === 3;
          const hasMore = media.length > 4;
          return (
            <div key={index} className="post-media-item" onClick={() => openModal(index)}>
              {item.type === 'VIDEO' ? (
                <video src={item.url} className="post-media-video" muted />
              ) : (
                <img src={item.url} alt="media" className="post-media-img" />
              )}
              {isLast && hasMore && (
                <div className="media-overlay">+{media.length - 4}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="user-avatar-placeholder">
          {authorInitial}
        </div>
        <div className="post-meta">
          <span className="post-author">{authorName}</span>
          <span className="post-time">{time}</span>
        </div>
        
        {/* Post Options Menu */}
        {user && user.id === author?._id && (
          <div className="post-options">
            <button className="btn-icon" onClick={() => setShowOptions(!showOptions)}>
              <MoreVertical size={18} />
            </button>
            {showOptions && (
              <div className="post-options-menu">
                {canEditPost && (
                  <button className="btn-edit" onClick={() => { setIsEditingPost(true); setShowOptions(false); }}>
                    <Edit2 size={16} /> Editar
                  </button>
                )}
                <button className="btn-delete" onClick={handleDeletePost}>
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="post-body">
        {post.location && (
          <div className="post-location">
            <span role="img" aria-label="pin">📍</span> {post.location}
          </div>
        )}
        
        {isEditingPost ? (
          <div className="post-edit-form">
            <textarea 
              className="post-edit-textarea" 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="post-edit-actions">
              <button className="btn-cancel" onClick={() => setIsEditingPost(false)}>Cancelar</button>
              <button className="btn-save" onClick={handleUpdatePost}>Guardar</button>
            </div>
          </div>
        ) : (
          <p className="post-text-content">{formattedText}</p>
        )}
        
        {ytId && !isEditingPost && (
          <div className="post-youtube-embed">
            <iframe 
              width="100%" 
              height="315" 
              src={`https://www.youtube.com/embed/${ytId}`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        )}

        {renderMediaGallery()}
      </div>
      <div className="post-footer">
        <button className={`btn-interaction ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} /> 
          {likesCount}
        </button>
        <button className="btn-interaction" onClick={toggleComments}>
          <MessageCircle size={18} /> {post.commentsCount || comments.length}
        </button>
      </div>

      {showComments && (
        <div className="post-comments-section">
          <form className="comment-form" onSubmit={handlePostComment}>
            <input 
              type="text" 
              placeholder="Escribe un comentario..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
            />
            <button type="submit" className="btn-comment-submit" disabled={!newComment.trim()}>
              <Send size={16} />
            </button>
          </form>

          {loadingComments ? (
            <div className="comments-loading">Cargando comentarios...</div>
          ) : (
            <div className="comments-list">
              {comments.map(comment => {
                const canEditComment = (Date.now() - new Date(comment.createdAt).getTime()) <= 900000;
                return (
                <div key={comment._id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.fk_id_user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.fk_id_user?.name}</span>
                      <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    {editingCommentId === comment._id ? (
                      <div className="comment-edit-form">
                        <input 
                          type="text" 
                          value={editCommentText} 
                          onChange={(e) => setEditCommentText(e.target.value)} 
                          className="comment-edit-input"
                        />
                        <div className="post-edit-actions" style={{ marginTop: '4px' }}>
                          <button className="btn-cancel" onClick={() => setEditingCommentId(null)}>Cancelar</button>
                          <button className="btn-save" onClick={() => handleUpdateComment(comment._id)}>Guardar</button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-text">{comment.content}</p>
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
              )})}
              {comments.length === 0 && <div className="no-comments">Sé el primero en comentar.</div>}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal para Galería */}
      {isModalOpen && media.length > 0 && (
        <div className="media-modal-overlay" onClick={closeModal}>
          <button className="modal-close-btn" onClick={closeModal}><X size={24} /></button>
          
          {media.length > 1 && (
            <button className="modal-nav-btn prev" onClick={prevMedia}><ChevronLeft size={32} /></button>
          )}
          
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {media[modalMediaIndex].type === 'VIDEO' ? (
              <video src={media[modalMediaIndex].url} controls autoPlay />
            ) : (
              <img src={media[modalMediaIndex].url} alt="Full view" />
            )}
          </div>

          {media.length > 1 && (
            <button className="modal-nav-btn next" onClick={nextMedia}><ChevronRight size={32} /></button>
          )}
        </div>
      )}
    </div>
  );
};
