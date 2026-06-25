import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { AuthContext } from '../../../context/AuthContext';
import { LayoutList, SlidersHorizontal, User } from 'lucide-react';
import './Sidebar.css';

export const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-links">
        <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutList className="nav-icon" size={24} />
          <span className="nav-label">Feed</span>
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <SlidersHorizontal className="nav-icon" size={24} />
          <span className="nav-label">Projects</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User className="nav-icon" size={24} />
          <span className="nav-label">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
