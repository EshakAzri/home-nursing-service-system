import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Users, UserCog, 
  FileText, Settings, LogOut, Menu, X,
  Activity, ClipboardList
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, toggleSidebar, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/nurses', icon: UserCog, label: 'Nurses' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <>
      <button className="admin-sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <Activity className="admin-sidebar-logo" size={32} />
          <h2 className="admin-sidebar-title">Admin Panel</h2>
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
                <Icon size={20} />
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
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {isOpen && <div className="admin-sidebar-overlay" onClick={toggleSidebar} />}
    </>
  );
};

export default AdminSidebar;
