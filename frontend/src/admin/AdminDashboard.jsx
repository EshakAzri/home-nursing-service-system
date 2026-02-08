import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, UserCog, DollarSign, 
  TrendingUp, Activity, CheckCircle, Clock,
  AlertCircle, XCircle, ArrowUpRight, ArrowDownRight, Download, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, ComposedChart } from 'recharts';
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
  const [bookingsByStatus, setBookingsByStatus] = useState([]);
  const [bookingsByBranch, setBookingsByBranch] = useState([]);
  const [bookingsByUser, setBookingsByUser] = useState([]);
  const [bookingsByNurse, setBookingsByNurse] = useState([]);
  const [monthlyBookings, setMonthlyBookings] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async (fromDate = '', toDate = '') => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {}
      };

      // Add date filters if provided
      if (fromDate) config.params.fromDate = fromDate;
      if (toDate) config.params.toDate = toDate;

      // Fetch all data in parallel
      const [bookingsRes, usersRes, nursesRes] = await Promise.all([
        axios.get('http://localhost:8080/api/bookings', config),
        axios.get('http://localhost:8080/api/users', config),
        axios.get('http://localhost:8080/api/nurses', config)
      ]);

      const bookings = bookingsRes.data;
      const users = usersRes.data;
      const nurses = nursesRes.data;

      // Filter bookings by status
      const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
      const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
      const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
      const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;

      // Calculate statistics
      const totalRevenue = completedBookings
        .reduce((sum, b) => sum + (b.finalCost || b.estimatedCost || 0), 0);

      const activeNurses = nurses.length;
      const availableNurses = nurses.filter(n => n.isAvailable).length;

      setStats({
        totalBookings: bookings.length,
        totalUsers: users.length,
        totalNurses: nurses.length,
        totalRevenue,
        pendingBookings,
        confirmedBookings,
        completedBookings: completedBookings.length,
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

      // Alternative: Show booking counts by status (for bar chart if revenue is empty)
      const bookingCountByStatus = [
        { status: 'PENDING', count: bookings.filter(b => b.status === 'PENDING').length },
        { status: 'CONFIRMED', count: bookings.filter(b => b.status === 'CONFIRMED').length },
        { status: 'IN_PROGRESS', count: bookings.filter(b => b.status === 'IN_PROGRESS').length },
        { status: 'COMPLETED', count: bookings.filter(b => b.status === 'COMPLETED').length },
        { status: 'CANCELLED', count: bookings.filter(b => b.status === 'CANCELLED').length }
      ];
      setBookingsByStatus(bookingCountByStatus);

      // Calculate bookings by branch (check for branch field, fallback to service type)
      const branchBookingCounts = {};
      bookings.forEach(booking => {
        // Priority: nurse.branch.name > service type > nurse specialization > General
        const branch = booking.nurse?.branch?.name ||
                      booking.serviceType?.name ||
                      booking.nurse?.specialization ||
                      'General';

        if (!branchBookingCounts[branch]) {
          branchBookingCounts[branch] = 0;
        }
        branchBookingCounts[branch]++;
      });

      const bookingsByBranch = Object.entries(branchBookingCounts)
        .map(([branch, count]) => ({ branch, count }))
        .sort((a, b) => b.count - a.count);

      setBookingsByBranch(bookingsByBranch);

      // Calculate bookings by user
      const userBookingCounts = {};
      bookings.forEach(booking => {
        // Better fallback: try firstName + lastName, then email, then user ID
        const userName = booking.user?.firstName && booking.user?.lastName 
          ? `${booking.user.firstName} ${booking.user.lastName}`
          : booking.user?.email 
          ? booking.user.email.split('@')[0] // Use part before @ in email
          : `User ${booking.user?.id || 'Unknown'}`;
        
        if (!userBookingCounts[userName]) {
          userBookingCounts[userName] = 0;
        }
        userBookingCounts[userName]++;
      });

      const bookingsByUser = Object.entries(userBookingCounts)
        .map(([user, count]) => ({ user, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 users

      setBookingsByUser(bookingsByUser);

      // Calculate bookings by nurse
      const nurseBookingCounts = {};
      bookings.forEach(booking => {
        const nurseName = `${booking.nurse?.firstName || 'Unknown'} ${booking.nurse?.lastName || 'Nurse'}`;
        if (!nurseBookingCounts[nurseName]) {
          nurseBookingCounts[nurseName] = 0;
        }
        nurseBookingCounts[nurseName]++;
      });

      const bookingsByNurse = Object.entries(nurseBookingCounts)
        .map(([nurse, count]) => ({ nurse, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 nurses

      setBookingsByNurse(bookingsByNurse);

      // Calculate monthly bookings and revenue trend (revenue only from completed bookings)
      const monthlyData = {};
      bookings.forEach(booking => {
        const date = new Date(booking.bookingDateTime);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { count: 0, revenue: 0 };
        }
        monthlyData[monthYear].count++;
        
        // Only add revenue for completed bookings
        if (booking.status === 'COMPLETED') {
          monthlyData[monthYear].revenue += (booking.finalCost || booking.estimatedCost || 0);
        }
      });

      const monthlyBookingsData = Object.entries(monthlyData)
        .map(([month, data]) => ({ 
          month, 
          count: data.count, 
          revenue: data.revenue 
        }))
        .sort((a, b) => {
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA - dateB;
        })
        .slice(-12); // Last 12 months

      setMonthlyBookings(monthlyBookingsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  }, [navigate]);

  const applyDateFilter = () => {
    fetchDashboardData(dateFrom, dateTo);
  };

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
    fetchDashboardData();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
  }, [fetchDashboardData, navigate]);

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
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR'
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

  const exportDashboardData = async () => {
    if (exportLoading) return; // Prevent multiple clicks
    
    setExportLoading(true);
    
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const csvData = [];
    
    // Add header
    csvData.push(['Home Nursing Service - Dashboard Report']);
    csvData.push(['Generated on', new Date().toLocaleString()]);
    if (dateFrom || dateTo) {
      csvData.push(['Date Filter Applied']);
      if (dateFrom) csvData.push(['From Date', dateFrom]);
      if (dateTo) csvData.push(['To Date', dateTo]);
    }
    csvData.push(['']);
    
    // Summary Statistics
    csvData.push(['SUMMARY STATISTICS']);
    csvData.push(['Metric', 'Value']);
    csvData.push(['Total Bookings', stats.totalBookings]);
    csvData.push(['Total Users', stats.totalUsers]);
    csvData.push(['Total Nurses', stats.totalNurses]);
    csvData.push(['Total Revenue (RM)', stats.totalRevenue]);
    csvData.push(['Pending Bookings', stats.pendingBookings]);
    csvData.push(['Confirmed Bookings', stats.confirmedBookings]);
    csvData.push(['Completed Bookings', stats.completedBookings]);
    csvData.push(['Cancelled Bookings', stats.cancelledBookings]);
    csvData.push(['Active Nurses', stats.activeNurses]);
    csvData.push(['Available Nurses', stats.availableNurses]);
    csvData.push(['']);
    
    // Bookings by Status
    csvData.push(['BOOKINGS BY STATUS']);
    csvData.push(['Status', 'Count']);
    bookingsByStatus.forEach(item => {
      csvData.push([item.status, item.count]);
    });
    csvData.push(['']);
    
    // Bookings by Branch
    csvData.push(['BOOKINGS BY BRANCH']);
    csvData.push(['Branch', 'Bookings']);
    bookingsByBranch.forEach(item => {
      csvData.push([item.branch, item.count]);
    });
    csvData.push(['']);
    
    // Top 5 Users by Bookings
    csvData.push(['TOP 5 USERS BY BOOKINGS']);
    csvData.push(['User', 'Bookings']);
    bookingsByUser.forEach(item => {
      csvData.push([item.user, item.count]);
    });
    csvData.push(['']);
    
    // Top 5 Nurses by Bookings
    csvData.push(['TOP 5 NURSES BY BOOKINGS']);
    csvData.push(['Nurse', 'Bookings']);
    bookingsByNurse.forEach(item => {
      csvData.push([item.nurse, item.count]);
    });
    csvData.push(['']);
    
    // Monthly Trends
    csvData.push(['MONTHLY BOOKINGS & REVENUE TREND']);
    csvData.push(['Month', 'Bookings', 'Revenue (RM)']);
    monthlyBookings.forEach(item => {
      csvData.push([item.month, item.count, item.revenue]);
    });
    csvData.push(['']);
    
    // Recent Bookings
    csvData.push(['RECENT BOOKINGS (Last 5)']);
    csvData.push(['Date', 'User', 'Nurse', 'Service', 'Status', 'Cost (RM)']);
    recentBookings.forEach(booking => {
      csvData.push([
        formatDate(booking.bookingDateTime),
        `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || booking.user?.email || 'N/A',
        `${booking.nurse?.firstName || ''} ${booking.nurse?.lastName || ''}`.trim() || 'N/A',
        booking.serviceType?.name || 'N/A',
        booking.status,
        booking.finalCost || booking.estimatedCost || 0
      ]);
    });
    
    // Convert to CSV string
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    } finally {
      setExportLoading(false);
    }
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
        {!sidebarOpen && <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>}
        <div className="admin-dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
           
          </div>
          
          {/* Date Filter */}
          <div className="date-filter">
            <div className="date-inputs">
              <div className="date-input-group">
                <label htmlFor="date-from">From:</label>
                <input
                  type="date"
                  id="date-from"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={dateTo || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="date-to">To:</label>
                <input
                  type="date"
                  id="date-to"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <button 
                className="filter-button"
                onClick={applyDateFilter}
                disabled={!dateFrom && !dateTo}
              >
                Apply Filter
              </button>
              {(dateFrom || dateTo) && (
                <button 
                  className="clear-filter-button"
                  onClick={clearDateFilter}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <button 
            className={`export-button ${exportLoading ? 'loading' : ''}`}
            onClick={exportDashboardData}
            disabled={exportLoading}
            title={exportLoading ? "Generating report..." : "Export Dashboard Data to CSV"}
          >
            {exportLoading ? (
              <Loader2 size={20} className="spin" />
            ) : (
              <Download size={20} />
            )}
            {exportLoading ? 'Generating...' : 'Export Report'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card primary">
            <div className="stat-icon">
              <Calendar size={28} />
            </div>
            <div className="stat-content">
              <h3>Total Bookings</h3>
              <p className="stat-value">{stats.totalBookings}</p>
              <div className="stat-detail">
                <span className="pending-count">
                  <Clock size={12} /> {stats.pendingBookings} Pending
                </span>
              </div>
            </div>
          </div>

          <div className="admin-stat-card success">
            <div className="stat-icon">
              <Users size={28} />
            </div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.totalUsers}</p>
              <div className="stat-detail">
                <TrendingUp size={12} /> Active accounts
              </div>
            </div>
          </div>

          <div className="admin-stat-card warning">
            <div className="stat-icon">
              <UserCog size={28} />
            </div>
            <div className="stat-content">
              <h3>Total Nurses</h3>
              <p className="stat-value">{stats.totalNurses}</p>
              <div className="stat-detail">
                <Activity size={12} /> {stats.availableNurses} Available
              </div>
            </div>
          </div>

          <div className="admin-stat-card revenue">
            <div className="stat-icon">
              <DollarSign size={28} />
            </div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
              <div className="stat-detail">
                <CheckCircle size={12} /> From {stats.completedBookings} completed
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid - Separate Charts */}
        <div className="admin-charts-grid">
          {/* Booking Status Chart */}
          <div className="admin-chart-card">
            <h2>Booking Status</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={bookingsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  label
                >
                  {bookingsByStatus.map((entry, index) => {
                    const colors = {
                      'PENDING': '#f59e0b',
                      'CONFIRMED': '#3b82f6',
                      'IN_PROGRESS': '#8b5cf6',
                      'COMPLETED': '#10b981',
                      'CANCELLED': '#ef4444'
                    };
                    return <Cell key={`cell-${index}`} fill={colors[entry.status]} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {bookingsByStatus.map((item, index) => {
                const colors = {
                  'PENDING': '#f59e0b',
                  'CONFIRMED': '#3b82f6',
                  'IN_PROGRESS': '#8b5cf6',
                  'COMPLETED': '#10b981',
                  'CANCELLED': '#ef4444'
                };
                return (
                  <div key={index} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: colors[item.status] }}></span>
                    <span>{item.status}: {item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bookings by Branch Chart */}
          <div className="admin-chart-card">
            <h2>Bookings by Branch</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bookingsByBranch}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Bookings">
                  {bookingsByBranch.map((entry, index) => {
                    const colors = [
                      '#7c3aed', // Purple
                      '#3b82f6', // Blue
                      '#10b981', // Green
                      '#f59e0b', // Yellow
                      '#ef4444', // Red
                      '#8b5cf6', // Violet
                      '#06b6d4', // Cyan
                      '#84cc16', // Lime
                      '#f97316', // Orange
                      '#ec4899'  // Pink
                    ];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {bookingsByBranch.map((item, index) => {
                const colors = [
                  '#7c3aed', // Purple
                  '#3b82f6', // Blue
                  '#10b981', // Green
                  '#f59e0b', // Yellow
                  '#ef4444', // Red
                  '#8b5cf6', // Violet
                  '#06b6d4', // Cyan
                  '#84cc16', // Lime
                  '#f97316', // Orange
                  '#ec4899'  // Pink
                ];
                return (
                  <div key={index} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: colors[index % colors.length] }}></span>
                    <span>{item.branch}: {item.count} bookings</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional Charts Row */}
        <div className="admin-charts-grid">
          {/* Bookings by User Chart */}
          <div className="admin-chart-card">
            <h2>Top 5 Users by Bookings</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bookingsByUser}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="user" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Bookings">
                  {bookingsByUser.map((entry, index) => {
                    const colors = [
                      '#7c3aed', // Purple
                      '#3b82f6', // Blue
                      '#10b981', // Green
                      '#f59e0b', // Yellow
                      '#ef4444'  // Red
                    ];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {bookingsByUser.map((item, index) => {
                const colors = [
                  '#7c3aed', // Purple
                  '#3b82f6', // Blue
                  '#10b981', // Green
                  '#f59e0b', // Yellow
                  '#ef4444'  // Red
                ];
                return (
                  <div key={index} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: colors[index % colors.length] }}></span>
                    <span>{item.user}: {item.count} bookings</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bookings by Nurse Chart */}
          <div className="admin-chart-card">
            <h2>Top 5 Nurses by Bookings</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={bookingsByNurse}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nurse, percent }) => `${nurse}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="nurse"
                >
                  {bookingsByNurse.map((entry, index) => {
                    const colors = [
                      '#7c3aed', // Purple
                      '#3b82f6', // Blue
                      '#10b981', // Green
                      '#f59e0b', // Yellow
                      '#ef4444'  // Red
                    ];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} bookings`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {bookingsByNurse.map((item, index) => {
                const colors = [
                  '#7c3aed', // Purple
                  '#3b82f6', // Blue
                  '#10b981', // Green
                  '#f59e0b', // Yellow
                  '#ef4444'  // Red
                ];
                return (
                  <div key={index} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: colors[index % colors.length] }}></span>
                    <span>{item.nurse}: {item.count} bookings</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Booking Status Overview */}
        <div className="admin-status-overview">
          <h2>Booking Status Overview</h2>
          <div className="status-grid">
            <div className="status-card pending">
              <Clock size={20} />
              <div>
                <p className="status-count">{stats.pendingBookings}</p>
                <p className="status-label">Pending</p>
              </div>
            </div>
            <div className="status-card confirmed">
              <CheckCircle size={20} />
              <div>
                <p className="status-count">{stats.confirmedBookings}</p>
                <p className="status-label">Confirmed</p>
              </div>
            </div>
            <div className="status-card completed">
              <Activity size={20} />
              <div>
                <p className="status-count">{stats.completedBookings}</p>
                <p className="status-label">Completed</p>
              </div>
            </div>
            <div className="status-card cancelled">
              <XCircle size={20} />
              <div>
                <p className="status-count">{stats.cancelledBookings}</p>
                <p className="status-label">Cancelled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Bookings Trend */}
        <div className="admin-chart-card full-width">
          <h2>Monthly Bookings & Revenue Trend</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Revenue shown only for completed bookings
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={monthlyBookings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Bookings') return [`${value} bookings`, name];
                  if (name === 'Revenue') return [formatCurrency(value), name];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="count" 
                fill="#7c3aed" 
                name="Bookings"
                radius={[4, 4, 0, 0]}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Revenue"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="admin-recent-section">
          <div className="admin-recent-bookings">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <button onClick={() => navigate('/admin/bookings')} className="view-all-btn">
                View All <ArrowUpRight size={14} />
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
                        <td>{booking.id}</td>
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
