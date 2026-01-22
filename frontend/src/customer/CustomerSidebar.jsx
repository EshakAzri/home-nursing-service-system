import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  User,
  FileText,
  LogOut,
  Home,
  Heart,
  Menu
} from 'lucide-react';
import './CustomerSidebar.css';

const CustomerSidebar = ({ onLogout, isOpen, onToggle }) => {
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
          username: payload.username || payload.sub || payload.name || 'User',
          email: payload.email || payload.userEmail || payload.mail || ''
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserInfo({ username: 'User', email: '' });
      }

      // Then fetch full user details from API
      axios.get('http://localhost:8080/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUserInfo({
          username: response.data.username || response.data.name || 'User',
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
      path: '/customer/dashboard',
      active: location.pathname === '/customer/dashboard'
    },
    {
      icon: Calendar,
      label: 'Book Service',
      path: '/customer/booking',
      active: location.pathname === '/customer/booking'
    },
    {
      icon: FileText,
      label: 'My Bookings',
      path: '/customer/bookings',
      active: location.pathname === '/customer/bookings'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/customer/profile',
      active: location.pathname === '/customer/profile'
    }
  ];

  return (
    <div className={`customer-sidebar ${!isOpen ? 'hidden' : ''}`}>
      <div className="customer-sidebar-header">
        <div className="customer-sidebar-logo">
          <Heart size={24} color="#374151" />
        </div>
        <span className="customer-sidebar-title">CareLink</span>
        <span className="customer-sidebar-subtitle">Customer Portal</span>
        <div className="customer-sidebar-user">
          <div className="customer-sidebar-username">{userInfo.username}</div>
          <div className="customer-sidebar-email">{userInfo.email || 'Loading...'}</div>
        </div>
        <button className="sidebar-close" onClick={onToggle}><Menu size={20} /></button>
      </div>

      <nav className="customer-sidebar-nav">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`customer-sidebar-item ${item.active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="customer-sidebar-footer">
        <button
          className="customer-sidebar-logout"
          onClick={onLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerSidebar;