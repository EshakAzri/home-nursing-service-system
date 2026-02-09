import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, TrendingUp, CheckCircle, XCircle, 
  AlertCircle, ArrowRight, User, DollarSign,
  Activity, FileText, MapPin, Briefcase
} from 'lucide-react';
import NurseSidebar from './NurseSidebar';
import './NurseDashboard.css';

const NurseDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    inProgress: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch user info
      const userResponse = await axios.get('http://localhost:8080/api/auth/me', config);
      setUserInfo({
        username: userResponse.data.username || 'Nurse',
        email: userResponse.data.email || ''
      });

      // Fetch nurse assignments/bookings
      const assignmentsResponse = await axios.get('http://localhost:8080/api/bookings/nurse-assignments', config);
      const assignmentsData = assignmentsResponse.data;
      setAssignments(assignmentsData);

      // Calculate statistics
      const now = new Date();
      const statistics = {
        total: assignmentsData.length,
        upcoming: assignmentsData.filter(b => {
          const bookingDate = new Date(b.bookingDateTime);
          return bookingDate > now && b.status === 'CONFIRMED';
        }).length,
        completed: assignmentsData.filter(b => b.status === 'COMPLETED').length,
        inProgress: assignmentsData.filter(b => b.status === 'IN_PROGRESS').length,
        totalEarnings: assignmentsData
          .filter(b => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + (b.estimatedCost || 0), 0)
      };

      setStats(statistics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { color: '#f59e0b', bg: '#fef3c7', icon: AlertCircle },
      'CONFIRMED': { color: '#3b82f6', bg: '#dbeafe', icon: CheckCircle },
      'IN_PROGRESS': { color: '#8b5cf6', bg: '#ede9fe', icon: Activity },
      'COMPLETED': { color: '#10b981', bg: '#d1fae5', icon: CheckCircle },
      'CANCELLED': { color: '#ef4444', bg: '#fee2e2', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig['PENDING'];
    const Icon = config.icon;

    return (
      <span 
        className="status-badge"
        style={{ 
          backgroundColor: config.bg, 
          color: config.color,
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <Icon size={14} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="nurse-layout">
        <NurseSidebar onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className="nurse-main">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const upcomingAssignments = assignments
    .filter(a => {
      const bookingDate = new Date(a.bookingDateTime);
      return bookingDate > new Date() && a.status === 'CONFIRMED';
    })
    .sort((a, b) => new Date(a.bookingDateTime) - new Date(b.bookingDateTime))
    .slice(0, 5);

  return (
    <div className="nurse-layout">
      <NurseSidebar onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className={`nurse-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        {!sidebarOpen && <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>}
        
        <div className="nurse-dashboard">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1>Welcome back, {userInfo.username}!</h1>
              <p>Here's an overview of your assignments</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
              <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
                <Briefcase size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Assignments</p>
                <h3 className="stat-value">{stats.total}</h3>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
              <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
                <Calendar size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Upcoming</p>
                <h3 className="stat-value">{stats.upcoming}</h3>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
              <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Completed</p>
                <h3 className="stat-value">{stats.completed}</h3>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
              <div className="stat-icon" style={{ backgroundColor: '#ede9fe', color: '#8b5cf6' }}>
                <DollarSign size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Earnings</p>
                <h3 className="stat-value">RM {stats.totalEarnings.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Upcoming Assignments</h2>
              <button 
                className="btn-view-all"
                onClick={() => navigate('/nurse/assignments')}
              >
                View All
                <ArrowRight size={16} />
              </button>
            </div>

            {upcomingAssignments.length === 0 ? (
              <div className="empty-state">
                <Calendar size={48} color="#9ca3af" />
                <p>No upcoming assignments</p>
              </div>
            ) : (
              <div className="assignments-list">
                {upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="assignment-card">
                    <div className="assignment-header">
                      <div className="assignment-date">
                        <Calendar size={20} />
                        <span>{formatDate(assignment.bookingDateTime)}</span>
                      </div>
                      {getStatusBadge(assignment.status)}
                    </div>
                    
                    <div className="assignment-body">
                      <div className="assignment-info">
                        <div className="info-row">
                          <User size={16} />
                          <span>Patient: {assignment.user?.username || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                          <FileText size={16} />
                          <span>Service: {assignment.serviceType?.name || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                          <Clock size={16} />
                          <span>Duration: {assignment.duration}h</span>
                        </div>
                        <div className="info-row">
                          <DollarSign size={16} />
                          <span>Fee: RM {assignment.estimatedCost?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>

                    {assignment.notes && (
                      <div className="assignment-notes">
                        <strong>Notes:</strong> {assignment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <button 
                className="action-card"
                onClick={() => navigate('/nurse/assignments')}
              >
                <Briefcase size={24} />
                <span>View All Assignments</span>
              </button>
              <button 
                className="action-card"
                onClick={() => navigate('/nurse/schedule')}
              >
                <Calendar size={24} />
                <span>My Schedule</span>
              </button>
              <button 
                className="action-card"
                onClick={() => navigate('/nurse/profile')}
              >
                <User size={24} />
                <span>Update Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
