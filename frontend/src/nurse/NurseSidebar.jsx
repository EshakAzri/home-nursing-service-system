import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  User,
  LogOut,
  Home,
  Stethoscope,
  Menu,
  X,
  ClipboardList
} from 'lucide-react';
import './NurseSidebar.css';

const NurseSidebar = ({ onLogout, isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // First, try to get basic info from token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          username: payload.username || payload.sub || payload.name || 'Nurse',
          email: payload.email || payload.userEmail || payload.mail || ''
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserInfo({ username: 'Nurse', email: '' });
      }

      // Then fetch full user details from API
      axios.get('http://localhost:8080/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUserInfo({
          username: response.data.username || response.data.name || 'Nurse',
          email: response.data.email || ''
        });
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
        // Keep the token-based info as fallback
      });
    }
  }, []);

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/nurse/dashboard',
      active: location.pathname === '/nurse/dashboard'
    },
    {
      icon: ClipboardList,
      label: 'My Assignments',
      path: '/nurse/assignments',
      active: location.pathname === '/nurse/assignments'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/nurse/profile',
      active: location.pathname === '/nurse/profile'
    }
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      onToggle();
    }
  };

  return (
    <>
    {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
    <div className={`nurse-sidebar ${!isOpen ? 'hidden' : ''}`}>
      <div className="nurse-sidebar-header">
        <div className="nurse-sidebar-logo">
          <Stethoscope size={24} color="#374151" />
        </div>
        <span className="nurse-sidebar-title">CareLink</span>
        <span className="nurse-sidebar-subtitle">Nurse Portal</span>
        <div className="nurse-sidebar-user">
          <div className="user-avatar">
            {userInfo.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="nurse-sidebar-username">{userInfo.username}</div>
            <div className="nurse-sidebar-email">{userInfo.email || 'Loading...'}</div>
          </div>
        </div>
        <button className="sidebar-close" onClick={onToggle}><X size={20} /></button>
      </div>

      <nav className="nurse-sidebar-nav">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`nurse-sidebar-item ${item.active ? 'active' : ''}`}
            onClick={() => handleNavClick(item.path)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="nurse-sidebar-footer">
        <button
          className="nurse-sidebar-logout"
          onClick={onLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
    </>
  );
};

export default NurseSidebar;
