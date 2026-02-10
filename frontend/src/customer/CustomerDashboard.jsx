import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, TrendingUp, CheckCircle, XCircle, 
  AlertCircle, Plus, ArrowRight, User, DollarSign,
  Activity, FileText, Star, MapPin
} from 'lucide-react';
import CustomerSidebar from './CustomerSidebar';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    totalSpent: 0
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
        username: userResponse.data.username || 'User',
        email: userResponse.data.email || ''
      });

      // Fetch bookings
      const bookingsResponse = await axios.get('http://localhost:8080/api/bookings/my-bookings', config);
      const bookingsData = bookingsResponse.data;
      setBookings(bookingsData);

      // Calculate statistics
      const now = new Date();
      const statistics = {
        total: bookingsData.length,
        upcoming: bookingsData.filter(b => {
          const bookingDate = new Date(b.bookingDateTime);
          return bookingDate > now && (b.status === 'CONFIRMED' || b.status === 'PENDING');
        }).length,
        completed: bookingsData.filter(b => b.status === 'COMPLETED').length,
        pending: bookingsData.filter(b => b.status === 'PENDING').length,
        cancelled: bookingsData.filter(b => b.status === 'CANCELLED').length,
        totalSpent: bookingsData
          .filter(b => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + (b.finalCost || 0), 0)
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

  const getUpcomingBookings = () => {
    const now = new Date();
    return bookings
      .filter(b => {
        const bookingDate = new Date(b.bookingDateTime);
        return bookingDate > now && (b.status === 'CONFIRMED' || b.status === 'PENDING');
      })
      .sort((a, b) => new Date(a.bookingDateTime) - new Date(b.bookingDateTime))
      .slice(0, 3);
  };

  const getRecentBookings = () => {
    return bookings
      .sort((a, b) => new Date(b.bookingDateTime) - new Date(a.bookingDateTime))
      .slice(0, 5);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'status-completed';
      case 'CONFIRMED': return 'status-confirmed';
      case 'PENDING': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: 'Good morning', icon: '🌅', message: 'Start your day with care!' };
    if (hour < 17) return { greeting: 'Good afternoon', icon: '☀️', message: 'Hope you\'re having a great day!' };
    return { greeting: 'Good evening', icon: '🌙', message: 'Time to relax and recover!' };
  };

  const getMotivationalTip = () => {
    const tips = [
      '💪 Stay hydrated and take your medications on time!',
      '🏥 Regular check-ups help maintain good health!',
      '❤️ Your health is your wealth - prioritize self-care!',
      '📱 Keep track of your appointments for better care!',
      '🌟 You\'re doing great by staying on top of your health!'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const timeGreeting = getTimeBasedGreeting();

  const quickActions = [
    {
      icon: Plus,
      title: 'Book New Service',
      description: 'Schedule a home nursing visit',
      action: () => navigate('/customer/booking'),
      color: 'action-primary'
    },
    {
      icon: FileText,
      title: 'View All Bookings',
      description: 'See your complete booking history',
      action: () => navigate('/customer/bookings'),
      color: 'action-secondary'
    },
    {
      icon: User,
      title: 'Edit Profile',
      description: 'Update your account details',
      action: () => navigate('/customer/profile'),
      color: 'action-tertiary'
    }
  ];

  if (loading) {
    return (
      <div className="customer-layout">
        <CustomerSidebar onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className="customer-main">
          <div className="dashboard-container">
            <div className="loading">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-layout">
      <CustomerSidebar onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className={`customer-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        {!sidebarOpen && <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>}
        
        <div className="dashboard-container">
          {/* Welcome Section */}
          <div className="dashboard-welcome dashboard-welcome-collapsed">
            <div className="welcome-content">
              <div className="welcome-greeting">
                <span className="greeting-icon">{timeGreeting.icon}</span>
                <h1>{timeGreeting.greeting}, {userInfo.username}!</h1>
              </div>
            </div>
            <div className="welcome-compact-actions">
              <div className="welcome-date-compact"><Calendar size={16} /> <span>{new Date().toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
              <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
                <Activity size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Bookings</p>
                <h3 className="stat-value">{stats.total}</h3>
              </div>
            </div>

            <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
              <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
                <Clock size={24} />
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
                <p className="stat-label">Total Spent</p>
                <h3 className="stat-value">RM {stats.totalSpent.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2 className="section-title">
              <TrendingUp size={24} />
              Quick Actions
            </h2>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <div 
                  key={index} 
                  className={`quick-action-card ${action.color}`}
                  onClick={action.action}
                >
                  <div className="quick-action-icon">
                    <action.icon size={32} />
                  </div>
                  <div className="quick-action-content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  <ArrowRight className="quick-action-arrow" size={20} />
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Upcoming Bookings */}
            <div className="dashboard-section">
              <h2 className="section-title">
                <Clock size={24} />
                Upcoming Bookings
              </h2>
              <div className="bookings-list">
                {getUpcomingBookings().length > 0 ? (
                  getUpcomingBookings().map((booking) => (
                    <div key={booking.id} className="booking-card upcoming">
                      <div className="booking-header">
                        <div className="booking-date">
                          <Calendar size={18} />
                          <span>{formatDate(booking.bookingDateTime)}</span>
                        </div>
                        <span className={`booking-status ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="booking-details">
                        <div className="booking-info">
                          <Star size={16} />
                          <span className="booking-service">{booking.serviceType?.name || 'N/A'}</span>
                        </div>
                        {booking.nurse && (
                          <div className="booking-info">
                            <User size={16} />
                            <span>{booking.nurse.firstName} {booking.nurse.lastName}</span>
                          </div>
                        )}
                        {booking.address && (
                          <div className="booking-info">
                            <MapPin size={16} />
                            <span>{booking.address}</span>
                          </div>
                        )}
                        {booking.estimatedCost && (
                          <div className="booking-info">
                            <DollarSign size={16} />
                            <span>RM{booking.estimatedCost.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <AlertCircle size={48} />
                    <p>No upcoming bookings</p>
                    <button className="btn-primary" onClick={() => navigate('/customer/booking')}>
                      <Plus size={18} />
                      Book a Service
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-section">
              <h2 className="section-title">
                <Activity size={24} />
                Recent Activity
              </h2>
              <div className="activity-list">
                {getRecentBookings().length > 0 ? (
                  getRecentBookings().map((booking) => (
                    <div key={booking.id} className="activity-item">
                      <div className={`activity-status-icon ${getStatusColor(booking.status)}`}>
                        {booking.status === 'COMPLETED' ? (
                          <CheckCircle size={20} />
                        ) : booking.status === 'CANCELLED' ? (
                          <XCircle size={20} />
                        ) : (
                          <Clock size={20} />
                        )}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">
                          {booking.serviceType?.name || 'Service'}
                        </div>
                        <div className="activity-subtitle">
                          {formatDate(booking.bookingDateTime)}
                          {booking.nurse && ` • ${booking.nurse.firstName} ${booking.nurse.lastName}`}
                        </div>
                      </div>
                      <span className={`activity-badge ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state-small">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
              {bookings.length > 5 && (
                <button 
                  className="btn-view-all" 
                  onClick={() => navigate('/customer/bookings')}
                >
                  View All Bookings
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
