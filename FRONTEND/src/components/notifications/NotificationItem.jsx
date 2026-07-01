import React from 'react';
import { Heart, MessageSquare, UserPlus } from 'lucide-react';
import './NotificationItem.css';
import ENVIRONMENT from '../../config/environment.js';

export const NotificationItem = ({ notification, onClick }) => {
    const { sender, type, is_read, created_at } = notification;

    const getIcon = () => {
        switch (type) {
            case 'LIKE': return <Heart size={16} className="text-pink-500" />;
            case 'COMMENT': return <MessageSquare size={16} className="text-blue-500" />;
            case 'PROJECT_INVITATION': return <UserPlus size={16} className="text-green-500" />;
            case 'FOLLOW': return <UserPlus size={16} className="text-purple-500" />;
            case 'CONNECTION': return <UserPlus size={16} className="text-yellow-500" style={{ color: '#f59e0b' }} />;
            default: return <Heart size={16} />;
        }
    };

    const getMessageText = () => {
        switch (type) {
            case 'LIKE': return 'le gustó tu publicación.';
            case 'COMMENT': return 'comentó en tu publicación.';
            case 'PROJECT_INVITATION': return 'te invitó a unirse a su proyecto musical.';
            case 'FOLLOW': return 'comenzó a seguirte.';
            case 'CONNECTION': return 'quiere conectar contigo.';
            default: return 'interactuó contigo.';
        }
    };

    // Calculate time elapsed
    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'hace un momento';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `hace ${diffInMinutes} m`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `hace ${diffInHours} h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `hace ${diffInDays} d`;
        return date.toLocaleDateString();
    };

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(sender?.name || 'U')}&background=8b5cf6&color=fff`;
    const userAvatarUrl = sender?.avatar 
        ? (sender.avatar.startsWith('http') ? sender.avatar : `${ENVIRONMENT.URL_API}/${sender.avatar.replace(/\\/g, '/')}`)
        : fallbackAvatar;

    return (
        <div 
            className={`notification-item ${!is_read ? 'unread' : ''}`}
            onClick={() => onClick(notification)}
        >
            <div className="notification-avatar-container">
                <img 
                    src={userAvatarUrl} 
                    alt={sender?.name} 
                    className="notification-avatar"
                    onError={(e) => { e.target.src = fallbackAvatar; }} 
                />
                <div className="notification-icon-badge">
                    {getIcon()}
                </div>
            </div>
            
            <div className="notification-content">
                <p>
                    <strong>{sender?.name} {sender?.last_name}</strong> {getMessageText()}
                </p>
                <span className="notification-time">{timeAgo(created_at)}</span>
            </div>
            
            {!is_read && <div className="notification-unread-dot"></div>}
        </div>
    );
};
