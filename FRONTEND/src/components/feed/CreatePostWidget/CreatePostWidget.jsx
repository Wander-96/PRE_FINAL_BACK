import React, { useState, useContext, useRef, useEffect } from 'react';
import { createPost } from '../../../services/postService.js';
import { AuthContext } from '../../../context/AuthContext';
import { Paperclip, Image as ImageIcon, Video, MapPin, X } from 'lucide-react';
import { LocationAutocomplete } from '../LocationAutocomplete/LocationAutocomplete.jsx';
import './CreatePostWidget.css';

export const CreatePostWidget = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [liveYtId, setLiveYtId] = useState(null);
  
  const fileInputRef = useRef(null);
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMediaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Escanear enlace de YT en vivo
  useEffect(() => {
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = content.match(ytRegex);
    if (match && match[1]) {
      setLiveYtId(match[1]);
    } else {
      setLiveYtId(null);
    }
  }, [content]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (mediaFiles.length + filesArray.length > 20) {
        setError('No puedes subir más de 20 archivos.');
        return;
      }
      // Validar 15MB limit preview
      const oversized = filesArray.some(f => f.size > 15 * 1024 * 1024);
      if (oversized) {
        setError('Algunos archivos superan el límite de 15MB.');
        return;
      }
      setMediaFiles(prev => [...prev, ...filesArray]);
      setError(null);
      setIsMediaMenuOpen(false);
    }
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      setUploadProgress(0);

      const formData = new FormData();
      if (content.trim()) formData.append('content', content);
      if (location.trim()) formData.append('location', location);
      
      mediaFiles.forEach(file => {
        formData.append('media', file);
      });

      const response = await createPost(formData, (progress) => {
        setUploadProgress(progress);
      });

      const newPost = {
        ...response.data,
        fk_id_user: {
           _id: user.id,
           name: user.name,
           avatar: user.avatar
        }
      };

      if(onPostCreated) {
        onPostCreated(newPost);
      }
      setContent('');
      setLocation('');
      setShowLocationInput(false);
      setMediaFiles([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="create-post-widget">
      {error && <div className="create-post-error" style={{color: '#EF4444', marginBottom: '1rem', fontSize: '0.85rem'}}>{error}</div>}
      <div className="create-post-header">
        <div className="user-avatar-placeholder">
           {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <textarea 
          placeholder="Share a new idea, riff or thought..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="create-post-input"
          disabled={isSubmitting}
        />
      </div>

      {showLocationInput && (
        <LocationAutocomplete 
          value={location}
          onChange={setLocation}
          disabled={isSubmitting}
        />
      )}

      {mediaFiles.length > 0 && (
        <div className="media-preview-container">
          {mediaFiles.map((file, index) => (
            <div key={index} className="media-preview-item">
              {file.type.startsWith('video') ? (
                <div className="video-preview-placeholder">
                  <Video size={24} />
                  <span>{file.name}</span>
                </div>
              ) : (
                <img src={URL.createObjectURL(file)} alt="preview" className="img-preview" />
              )}
              <button className="remove-media-btn" onClick={() => removeMedia(index)} disabled={isSubmitting}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {liveYtId && (
        <div className="live-yt-preview">
          <iframe 
            width="100%" 
            height="200" 
            src={`https://www.youtube.com/embed/${liveYtId}`} 
            title="YouTube preview" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            style={{ borderRadius: '8px', marginTop: '10px' }}
          ></iframe>
        </div>
      )}

      {isSubmitting && uploadProgress > 0 && (
        <div className="upload-progress-container">
          <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
          <span className="upload-progress-text">{uploadProgress}% Uploading...</span>
        </div>
      )}

      <div className="create-post-footer">
        <div className="create-post-actions">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            multiple
            accept="image/*,video/mp4,video/webm"
          />
          <div className="media-dropdown-container" ref={dropdownRef}>
            <button 
              className="btn-action" 
              onClick={() => setIsMediaMenuOpen(!isMediaMenuOpen)}
              title="Attach media"
              disabled={isSubmitting}
            >
              <Paperclip size={18} /> Attach
            </button>
            
            {isMediaMenuOpen && !isSubmitting && (
              <div className="media-dropdown">
                <button className="media-dropdown-item" onClick={() => {
                  fileInputRef.current.accept = "image/*";
                  fileInputRef.current.click();
                }}>
                  <ImageIcon size={16} /> Image
                </button>
                <button className="media-dropdown-item" onClick={() => {
                  fileInputRef.current.accept = "video/mp4,video/webm";
                  fileInputRef.current.click();
                }}>
                  <Video size={16} /> Video
                </button>
              </div>
            )}
          </div>
          <button 
            className={`btn-action ${location || showLocationInput ? 'active' : ''}`} 
            title="Add location"
            onClick={() => setShowLocationInput(!showLocationInput)}
            disabled={isSubmitting}
          >
            <MapPin size={18} />
          </button>
        </div>
        <button 
          className="btn-primary btn-submit" 
          disabled={(!content.trim() && mediaFiles.length === 0) || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (uploadProgress > 0 ? 'Uploading...' : 'Posting...') : 'Post'}
        </button>
      </div>
    </div>
  );
};
