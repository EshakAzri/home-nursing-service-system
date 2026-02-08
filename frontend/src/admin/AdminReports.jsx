import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, Calendar, Users, 
  Download, FileText, BarChart3, PieChart
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import './AdminReports.css';

const AdminReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    averageBookingCost: 0,
    totalNurses: 0,
    totalPatients: 0,
    activeNurses: 0
  });
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [bookingsByStatus, setBookingsByStatus] = useState([]);
  const [topNurses, setTopNurses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    
    fetchReportData();
  }, [navigate, dateRange]);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [bookingsRes, nursesRes, usersRes] = await Promise.all([
        axios.get('http://localhost:8080/api/bookings', config),
        axios.get('http://localhost:8080/api/nurses', config),
        axios.get('http://localhost:8080/api/users', config)
      ]);

      const bookings = bookingsRes.data;
      const nurses = nursesRes.data;
      const users = usersRes.data;

      // Filter by date range
      let filteredBookings = filterBookingsByDateRange(bookings, dateRange);

      // Calculate statistics
      const completedBookings = filteredBookings.filter(b => b.status === 'COMPLETED');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.finalCost || b.estimatedCost || 0), 0);
      const averageBookingCost = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

      setStats({
        totalRevenue,
        totalBookings: filteredBookings.length,
        completedBookings: completedBookings.length,
        cancelledBookings: filteredBookings.filter(b => b.status === 'CANCELLED').length,
        averageBookingCost,
        totalNurses: nurses.length,
        totalPatients: users.filter(u => u.role === 'PATIENT').length,
        activeNurses: nurses.filter(n => n.isAvailable).length
      });

      // Calculate revenue by month
      const revenueByMonthData = calculateRevenueByMonth(completedBookings);
      setRevenueByMonth(revenueByMonthData);

      // Calculate bookings by status
      const statusCounts = [
        { status: 'PENDING', count: filteredBookings.filter(b => b.status === 'PENDING').length },
        { status: 'CONFIRMED', count: filteredBookings.filter(b => b.status === 'CONFIRMED').length },
        { status: 'IN_PROGRESS', count: filteredBookings.filter(b => b.status === 'IN_PROGRESS').length },
        { status: 'COMPLETED', count: filteredBookings.filter(b => b.status === 'COMPLETED').length },
        { status: 'CANCELLED', count: filteredBookings.filter(b => b.status === 'CANCELLED').length }
      ];
      setBookingsByStatus(statusCounts);

      // Calculate top nurses
      const nurseBookingCounts = {};
      completedBookings.forEach(booking => {
        const nurseId = booking.nurse?.id;
        if (nurseId) {
          if (!nurseBookingCounts[nurseId]) {
            nurseBookingCounts[nurseId] = {
              nurse: booking.nurse,
              bookings: 0,
              revenue: 0
            };
          }
          nurseBookingCounts[nurseId].bookings++;
          nurseBookingCounts[nurseId].revenue += (booking.finalCost || booking.estimatedCost || 0);
        }
      });

      const topNursesData = Object.values(nurseBookingCounts)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      setTopNurses(topNursesData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const filterBookingsByDateRange = (bookings, range) => {
    if (range === 'all') return bookings;

    const now = new Date();
    let startDate;

    switch (range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return bookings;
    }

    return bookings.filter(b => new Date(b.createdAt) >= startDate);
  };

  const calculateRevenueByMonth = (bookings) => {
    const monthlyRevenue = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.bookingDateTime);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyRevenue[monthYear]) {
        monthlyRevenue[monthYear] = 0;
      }
      monthlyRevenue[monthYear] += (booking.finalCost || booking.estimatedCost || 0);
    });

    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-6); // Last 6 months
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const handleExportReport = () => {
    // Simple CSV export
    const csvContent = `
Home Nursing Service System - Report
Generated: ${new Date().toLocaleString()}
Date Range: ${dateRange}

Summary Statistics
Total Revenue,${stats.totalRevenue}
Total Bookings,${stats.totalBookings}
Completed Bookings,${stats.completedBookings}
Cancelled Bookings,${stats.cancelledBookings}
Average Booking Cost,${stats.averageBookingCost}
Total Nurses,${stats.totalNurses}
Active Nurses,${stats.activeNurses}
Total Patients,${stats.totalPatients}

Bookings by Status
${bookingsByStatus.map(s => `${s.status},${s.count}`).join('\n')}

Top Nurses by Revenue
${topNurses.map((n, i) => `${i + 1},${n.nurse.firstName} ${n.nurse.lastName},${n.bookings},${n.revenue}`).join('\n')}
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={`admin-dashboard-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {!sidebarOpen && <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>}
        <div className="admin-page-header">
          <div>
            <h1>Reports & Analytics</h1>
            <p>Overview of system performance and statistics</p>
          </div>
          <div className="header-actions">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="date-range-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
            <button className="export-btn" onClick={handleExportReport}>
              <Download size={20} />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card revenue">
            <div className="metric-icon">
              <DollarSign size={32} />
            </div>
            <div className="metric-content">
              <h3>Total Revenue</h3>
              <p className="metric-value">{formatCurrency(stats.totalRevenue)}</p>
              <span className="metric-description">From completed bookings</span>
            </div>
          </div>

          <div className="metric-card bookings">
            <div className="metric-icon">
              <Calendar size={32} />
            </div>
            <div className="metric-content">
              <h3>Total Bookings</h3>
              <p className="metric-value">{stats.totalBookings}</p>
              <span className="metric-description">{stats.completedBookings} completed</span>
            </div>
          </div>

          <div className="metric-card average">
            <div className="metric-icon">
              <TrendingUp size={32} />
            </div>
            <div className="metric-content">
              <h3>Average Cost</h3>
              <p className="metric-value">{formatCurrency(stats.averageBookingCost)}</p>
              <span className="metric-description">Per booking</span>
            </div>
          </div>

          <div className="metric-card nurses">
            <div className="metric-icon">
              <Users size={32} />
            </div>
            <div className="metric-content">
              <h3>Active Nurses</h3>
              <p className="metric-value">{stats.activeNurses}/{stats.totalNurses}</p>
              <span className="metric-description">Currently available</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <h2><BarChart3 size={24} /> Revenue by Month</h2>
            </div>
            <div className="chart-content">
              {revenueByMonth.length === 0 ? (
                <div className="no-data">No revenue data available</div>
              ) : (
                <div className="bar-chart">
                  {revenueByMonth.map((data, index) => {
                    const maxRevenue = Math.max(...revenueByMonth.map(d => d.revenue));
                    const heightPercent = (data.revenue / maxRevenue) * 100;
                    
                    return (
                      <div key={index} className="bar-item">
                        <div className="bar-container">
                          <div 
                            className="bar" 
                            style={{ height: `${heightPercent}%` }}
                            title={formatCurrency(data.revenue)}
                          >
                            <span className="bar-value">{formatCurrency(data.revenue)}</span>
                          </div>
                        </div>
                        <div className="bar-label">{data.month}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h2><PieChart size={24} /> Bookings by Status</h2>
            </div>
            <div className="chart-content">
              <div className="status-breakdown">
                {bookingsByStatus.map((status, index) => (
                  <div key={index} className="status-item">
                    <div className="status-info">
                      <span className={`status-dot ${status.status.toLowerCase()}`}></span>
                      <span className="status-name">{status.status}</span>
                    </div>
                    <span className="status-count">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Nurses */}
        <div className="top-nurses-section">
          <div className="section-header">
            <h2>Top Performing Nurses</h2>
            <span className="section-subtitle">By revenue generated</span>
          </div>
          <div className="top-nurses-list">
            {topNurses.length === 0 ? (
              <div className="no-data">No data available</div>
            ) : (
              topNurses.map((nurseData, index) => (
                <div key={index} className="top-nurse-item">
                  <div className="nurse-rank">#{index + 1}</div>
                  <div className="nurse-avatar">
                    {nurseData.nurse.firstName.charAt(0)}{nurseData.nurse.lastName.charAt(0)}
                  </div>
                  <div className="nurse-details">
                    <h4>{nurseData.nurse.firstName} {nurseData.nurse.lastName}</h4>
                    <p>{nurseData.nurse.specialization}</p>
                  </div>
                  <div className="nurse-stats-row">
                    <div className="stat-item">
                      <span className="stat-label">Bookings</span>
                      <span className="stat-value">{nurseData.bookings}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Revenue</span>
                      <span className="stat-value revenue">{formatCurrency(nurseData.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;
