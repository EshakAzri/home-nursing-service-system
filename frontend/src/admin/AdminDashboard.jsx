import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, UserCog, DollarSign, 
  TrendingUp, Activity, CheckCircle, Clock,
  AlertCircle, XCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalUsers: 0,
    totalNurses: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    activeNurses: 0,
    availableNurses: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch all data in parallel
      const [bookingsRes, usersRes, nursesRes] = await Promise.all([
        axios.get('http://localhost:8080/api/bookings', config),
        axios.get('http://localhost:8080/api/users', config),
        axios.get('http://localhost:8080/api/nurses', config)
      ]);

      const bookings = bookingsRes.data;
      const users = usersRes.data;
      const nurses = nursesRes.data;

      // Calculate statistics
      const totalRevenue = bookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.finalCost || b.estimatedCost || 0), 0);

      const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
      const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
      const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
      const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
      const activeNurses = nurses.length;
      const availableNurses = nurses.filter(n => n.isAvailable).length;

      setStats({
        totalBookings: bookings.length,
        totalUsers: users.length,
        totalNurses: nurses.length,
        totalRevenue,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        activeNurses,
        availableNurses
      });

      // Get recent bookings (last 5)
      const sortedBookings = [...bookings]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentBookings(sortedBookings);

      // Get recent users (non-admin, last 5)
      const sortedUsers = [...users]
        .filter(u => u.role !== 'ADMIN')
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);
      setRecentUsers(sortedUsers);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-badge pending';
      case 'CONFIRMED': return 'status-badge confirmed';
      case 'COMPLETED': return 'status-badge completed';
      case 'CANCELLED': return 'status-badge cancelled';
      case 'IN_PROGRESS': return 'status-badge in-progress';
      default: return 'status-badge';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={`admin-dashboard-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="admin-dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back! Here's what's happening today.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card primary">
            <div className="stat-icon">
              <Calendar size={32} />
            </div>
            <div className="stat-content">
              <h3>Total Bookings</h3>
              <p className="stat-value">{stats.totalBookings}</p>
              <div className="stat-detail">
                <span className="pending-count">
                  <Clock size={14} /> {stats.pendingBookings} Pending
                </span>
              </div>
            </div>
          </div>

          <div className="admin-stat-card success">
            <div className="stat-icon">
              <Users size={32} />
            </div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.totalUsers}</p>
              <div className="stat-detail">
                <TrendingUp size={14} /> Active accounts
              </div>
            </div>
          </div>

          <div className="admin-stat-card warning">
            <div className="stat-icon">
              <UserCog size={32} />
            </div>
            <div className="stat-content">
              <h3>Total Nurses</h3>
              <p className="stat-value">{stats.totalNurses}</p>
              <div className="stat-detail">
                <Activity size={14} /> {stats.availableNurses} Available
              </div>
            </div>
          </div>

          <div className="admin-stat-card revenue">
            <div className="stat-icon">
              <DollarSign size={32} />
            </div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
              <div className="stat-detail">
                <CheckCircle size={14} /> From {stats.completedBookings} completed
              </div>
            </div>
          </div>
        </div>

        {/* Booking Status Overview */}
        <div className="admin-status-overview">
          <h2>Booking Status Overview</h2>
          <div className="status-grid">
            <div className="status-card pending">
              <Clock size={24} />
              <div>
                <p className="status-count">{stats.pendingBookings}</p>
                <p className="status-label">Pending</p>
              </div>
            </div>
            <div className="status-card confirmed">
              <CheckCircle size={24} />
              <div>
                <p className="status-count">{stats.confirmedBookings}</p>
                <p className="status-label">Confirmed</p>
              </div>
            </div>
            <div className="status-card completed">
              <Activity size={24} />
              <div>
                <p className="status-count">{stats.completedBookings}</p>
                <p className="status-label">Completed</p>
              </div>
            </div>
            <div className="status-card cancelled">
              <XCircle size={24} />
              <div>
                <p className="status-count">{stats.cancelledBookings}</p>
                <p className="status-label">Cancelled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-recent-section">
          <div className="admin-recent-bookings">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <button onClick={() => navigate('/admin/bookings')} className="view-all-btn">
                View All <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Nurse</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">No bookings found</td>
                    </tr>
                  ) : (
                    recentBookings.map(booking => (
                      <tr key={booking.id}>
                        <td>#{booking.id}</td>
                        <td>{booking.user?.username || 'N/A'}</td>
                        <td>{booking.nurse ? `${booking.nurse.firstName} ${booking.nurse.lastName}` : 'N/A'}</td>
                        <td>{booking.serviceType?.name || 'N/A'}</td>
                        <td>{formatDate(booking.bookingDateTime)}</td>
                        <td>
                          <span className={getStatusBadgeClass(booking.status)}>
                            {booking.status}
                          </span>
                        </td>
                        <td>{formatCurrency(booking.estimatedCost)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-recent-users">
            <div className="section-header">
              <h2>Recent Users</h2>
              <button onClick={() => navigate('/admin/users')} className="view-all-btn">
                View All <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="users-list">
              {recentUsers.length === 0 ? (
                <p className="no-data">No users found</p>
              ) : (
                recentUsers.map(user => (
                  <div key={user.id} className="user-item">
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <p className="user-name">{user.username}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
