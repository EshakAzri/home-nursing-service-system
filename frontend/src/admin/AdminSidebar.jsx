import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Calendar, Users, UserCog, 
  FileText, Settings, LogOut, Menu, X,
  Activity, ClipboardList, DollarSign
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, toggleSidebar, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // First, try to get basic info from token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          username: payload.username || payload.sub || payload.name || 'Admin',
          email: payload.email || payload.userEmail || payload.mail || ''
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserInfo({ username: 'Admin', email: '' });
      }

      // Then fetch full user details from API
      axios.get('http://localhost:8080/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUserInfo({
          username: response.data.username || response.data.name || 'Admin',
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
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/nurses', icon: UserCog, label: 'Nurses' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/earnings', icon: DollarSign, label: 'Earnings' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <>
      <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <Activity size={24} />
          </div>
          <span className="admin-sidebar-title">Admin Panel</span>
          <span className="admin-sidebar-subtitle">Management Portal</span>
          <div className="admin-sidebar-user">
            <div className="user-avatar">
              {userInfo.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="admin-sidebar-username">{userInfo.username}</div>
              <div className="admin-sidebar-email">{userInfo.email || 'Loading...'}</div>
            </div>
          </div>
          <button className="sidebar-close" onClick={toggleSidebar}>
            <Menu size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button 
            className="admin-sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      {isOpen && <div className="admin-sidebar-overlay" onClick={toggleSidebar} />}
    </>
  );
};

export default AdminSidebar;
