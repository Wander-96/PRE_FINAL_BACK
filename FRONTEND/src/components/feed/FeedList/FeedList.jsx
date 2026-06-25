import React, { useState, useEffect } from 'react';
import { CreatePostWidget } from '../CreatePostWidget/CreatePostWidget';
import { PostCard } from '../PostCard/PostCard';
import { getFeed } from '../../../services/postService.js';
import './FeedList.css';

export const FeedList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await getFeed();
      // El backend devuelve { ok: true, data: [...] }
      setPosts(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePostCreated = (newPost) => {
    // Agregamos el nuevo post al principio de la lista
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <div className="feed-list-container">
      <CreatePostWidget onPostCreated={handlePostCreated} />
      
      {loading && <div className="feed-status">Cargando el muro...</div>}
      {error && <div className="feed-status error">{error}</div>}
      
      {!loading && !error && posts.length === 0 && (
        <div className="feed-status empty">No hay publicaciones aún. ¡Sé el primero en compartir algo!</div>
      )}

      {posts.map(post => (
        <PostCard key={post._id} post={post} />
      ))}
      
      {!loading && posts.length > 0 && (
        <button className="btn-load-more">Cargar Más</button>
      )}
    </div>
  );
};
