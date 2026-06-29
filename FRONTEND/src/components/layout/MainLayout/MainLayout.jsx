import React from 'react';
import { Outlet } from 'react-router';
import { Navbar } from '../Navbar/Navbar.jsx';
import { Sidebar } from '../Sidebar/Sidebar.jsx';
import { FloatingMessenger } from '../../messenger/FloatingMessenger.jsx';
import './MainLayout.css';

export const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <FloatingMessenger />
    </div>
  );
};
