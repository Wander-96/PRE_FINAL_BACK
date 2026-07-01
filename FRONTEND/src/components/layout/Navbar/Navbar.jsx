import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../../../context/AuthContext.jsx';
import { Search, MessageSquare, Bell, User, LogOut, Music } from 'lucide-react';
import { getMyNotifications, markAllAsRead } from '../../../services/notificationService.js';
import { NotificationItem } from '../../notifications/NotificationItem.jsx';
import logoMib from '../../../assets/logo_mib.png';
import './Navbar.css';

export const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();
      if (data.ok) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const handleNotifToggle = async () => {
    const newState = !isNotifOpen;
    setIsNotifOpen(newState);
    
    // Mark as read when opening
    if (newState && unreadCount > 0) {
      try {
        await markAllAsRead();
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (err) {
        console.error("Error marking notifications as read", err);
      }
    }
  };

  const handleNotificationClick = (notification) => {
    setIsNotifOpen(false);
    if (notification.type === 'LIKE' || notification.type === 'COMMENT') {
       // Redirigir al post individual
       if (notification.related_entity) {
         navigate(`/post/${notification.related_entity}`);
       } else {
         navigate('/home');
       }
    } else if (notification.type === 'PROJECT_INVITATION') {
       navigate('/projects');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleProfile = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Opcional: limpiar la barra
    }
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src={logoMib} alt="MIB Logo" className="navbar-logo-img" style={{ height: '40px', width: 'auto' }} />
      </div>

      <div className="navbar-center">
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search musicians, tracks, sessions" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="navbar-right">
        <button className="icon-btn" aria-label="Messages" onClick={() => navigate('/messages')}>
          <MessageSquare size={20} />
        </button>
        <div className="notification-menu-container" ref={notifRef}>
          <button className="icon-btn" aria-label="Notifications" onClick={handleNotifToggle}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {isNotifOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notificaciones</h4>
              </div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <NotificationItem 
                      key={notif._id} 
                      notification={notif} 
                      onClick={handleNotificationClick} 
                    />
                  ))
                ) : (
                  <div className="notification-empty">
                    <p>Aún no hay notificaciones</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-menu-container" ref={dropdownRef}>
          <button 
            className="profile-avatar-btn" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-fallback">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>

          {isDropdownOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <strong>{user?.name || 'Usuario'} {user?.apellido || ''}</strong>
                <span>{user?.email || '@usuario'}</span>
              </div>
              <hr />
              <button onClick={handleProfile} className="dropdown-item">
                <User size={16} /> Mi Perfil
              </button>
              <button onClick={handleLogout} className="dropdown-item text-danger">
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
