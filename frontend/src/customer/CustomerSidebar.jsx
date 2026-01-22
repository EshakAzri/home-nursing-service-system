import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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