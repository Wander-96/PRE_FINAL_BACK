import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../../../context/AuthContext';
import { Search, MessageSquare, Bell, User, LogOut, Music } from 'lucide-react';
import './Navbar.css';

export const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleProfile = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <Music className="navbar-logo-icon" size={24} color="#8b5cf6" />
        <span className="navbar-logo-text">MIB</span>
      </div>

      <div className="navbar-center">
        <div className="search-bar">
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Search musicians, tracks, sessions" />
        </div>
      </div>

      <div className="navbar-right">
        <button className="icon-btn" aria-label="Messages">
          <MessageSquare size={20} />
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>

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
