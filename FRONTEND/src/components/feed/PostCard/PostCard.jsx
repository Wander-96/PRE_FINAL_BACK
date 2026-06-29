import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext.jsx';
import { toggleLike, deletePost, updatePost } from '../../../services/postService.js';
import { getCommentsByPost, createComment, deleteComment, updateComment } from '../../../services/commentService.js';
import { MoreVertical, Trash2, Heart, MessageCircle, Send, Edit2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { PostDetailModal } from '../PostDetailModal/PostDetailModal.jsx';
import './PostCard.css';

export const CommentText = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = text.split('\n');
  const isLong = lines.length > 3 || text.length > 150;

  if (!isLong || isExpanded) {
    return (
      <div className="comment-text-wrapper">
        <p className="comment-text">{text}</p>
        {isLong && <button className="btn-see-more" onClick={() => setIsExpanded(false)}>Ver menos</button>}
      </div>
    );
  }

  // Truncate logic
  let truncatedText = lines.slice(0, 3).join('\n');
  if (truncatedText.length > 150) {
    truncatedText = truncatedText.substring(0, 150);
  }
  truncatedText += '...';

  return (
    <div className="comment-text-wrapper">
      <p className="comment-text">{truncatedText}</p>
      <button className="btn-see-more" onClick={() => setIsExpanded(true)}>Ver más</button>
    </div>
  );
};

export const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useContext(AuthContext);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(false); // Asumiremos falso inicialmente hasta tener sync de DB
  const [showOptions, setShowOptions] = useState(false);
  
  // Edit Post state
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editMedia, setEditMedia] = useState(post.media || []);
  
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const author = post.fk_id_user;
  const authorName = author?.name || 'Musician';
  const authorInitial = authorName.charAt(0).toUpperCase();
  const time = new Date(post.createdAt).toLocaleString();

  const media = post.media || [];
  
  const canEditPost = (Date.now() - new Date(post.createdAt).getTime()) <= 900000;

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=8b5cf6&color=fff`;
  const authorAvatarUrl = author?.avatar 
      ? (author.avatar.startsWith('http') ? author.avatar : `${ENVIRONMENT.URL_API}/${author.avatar.replace(/\\/g, '/')}`)
      : null;

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
      await updatePost(post._id, { content: editContent, media: editMedia });
      post.content = editContent; // local update
      post.media = editMedia;
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
    if (e) e.preventDefault();
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

  const handleUpdatePostFromModal = (updatedPost) => {
    setLikesCount(updatedPost.likesCount);
    if (updatedPost.commentsCount !== undefined) {
      post.commentsCount = updatedPost.commentsCount;
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

    const displayMedia = media.slice(0, 3);
    const layoutClass = `media-layout-${Math.min(media.length, 3)}`;
    
    return (
      <div className={`post-media-gallery ${layoutClass}`}>
        {displayMedia.map((item, index) => {
          const isLast = index === 2;
          const hasMore = media.length > 3;
          return (
            <div key={index} className="post-media-item" onClick={() => openModal(index)}>
              {item.type === 'VIDEO' ? (
                <video src={item.url} className="post-media-video" muted />
              ) : (
                <img src={item.url} alt="media" className="post-media-img" />
              )}
              {isLast && hasMore && (
                <div className="media-overlay">+{media.length - 3}</div>
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
        {authorAvatarUrl ? (
            <Link to={`/profile/${author?._id}`}>
              <img 
                  src={authorAvatarUrl} 
                  alt="Avatar" 
                  className="user-avatar-placeholder" 
                  style={{ padding: 0, objectFit: 'cover' }} 
                  onError={(e) => { e.target.src = fallbackAvatar; }} 
              />
            </Link>
        ) : (
            <Link to={`/profile/${author?._id}`} className="user-avatar-placeholder" style={{ textDecoration: 'none', color: 'inherit' }}>
                {authorInitial}
            </Link>
        )}
        <div className="post-meta">
          <Link to={`/profile/${author?._id}`} className="post-author" style={{ textDecoration: 'none', color: 'inherit' }}>{authorName}</Link>
          <span className="post-time">{time}</span>
        </div>
        
        {user && user.id === author?._id && (
          <div className="post-options">
            <button className="btn-icon" onClick={() => setShowOptions(!showOptions)}>
              <MoreVertical size={18} />
            </button>
            {showOptions && (
              <div className="post-options-menu">
                {canEditPost && (
                  <button className="btn-edit" onClick={() => { 
                    setIsEditingPost(true); 
                    setEditContent(post.content);
                    setEditMedia(post.media || []);
                    setShowOptions(false); 
                  }}>
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
            {editMedia.length > 0 && (
              <div className="post-edit-media-gallery">
                {editMedia.map((item, index) => (
                  <div key={index} className="edit-media-item">
                    {item.type === 'VIDEO' ? (
                      <video src={item.url} muted />
                    ) : (
                      <img src={item.url} alt="media" />
                    )}
                    <button className="btn-remove-media" onClick={() => setEditMedia(editMedia.filter((_, i) => i !== index))}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            <textarea 
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

          {loadingComments ? (
            <div className="comments-loading">Cargando comentarios...</div>
          ) : (
            <div className="comments-list">
              {comments.map(comment => {
                const canEditComment = (Date.now() - new Date(comment.createdAt).getTime()) <= 900000;
                return (
                <div key={comment._id} className="comment-item">
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
                          style={{ resize: 'vertical' }}
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
              )})}
              {comments.length === 0 && <div className="no-comments">Sé el primero en comentar.</div>}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <PostDetailModal 
          post={post} 
          initialMediaIndex={modalMediaIndex} 
          onClose={closeModal} 
          onUpdatePost={handleUpdatePostFromModal}
        />
      )}
    </div>
  );
};
