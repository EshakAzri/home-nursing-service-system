import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Download, Filter, TrendingUp, DollarSign, 
  Calendar, Users, CheckCircle 
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import './AdminEarnings.css';

const AdminEarnings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [earnings, setEarnings] = useState([]);
  const [filteredEarnings, setFilteredEarnings] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('earnings'); // earnings, bookings, name
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    
    fetchEarnings();
  }, [navigate, selectedMonth]);

  useEffect(() => {
    filterAndSortEarnings();
  }, [searchTerm, earnings, sortBy, sortOrder]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(
        `http://localhost:8080/api/nurses/earnings/all?month=${selectedMonth}`,
        config
      );

      setEarnings(response.data);
      
      // Calculate totals
      const total = response.data.reduce((sum, item) => sum + (item.totalEarnings || 0), 0);
      const commission = response.data.reduce((sum, item) => sum + (item.commission || 0), 0);
      setTotalEarnings(total);
      setTotalCommission(commission);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const filterAndSortEarnings = () => {
    let filtered = earnings.filter(item =>
      `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'earnings') {
        compareValue = (a.totalEarnings || 0) - (b.totalEarnings || 0);
      } else if (sortBy === 'bookings') {
        compareValue = (a.completedBookings || 0) - (b.completedBookings || 0);
      } else if (sortBy === 'name') {
        compareValue = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredEarnings(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount || 0);
  };

  const handleExportCSV = () => {
    const headers = ['Nurse Name', 'Email', 'Specialization', 'Completed Bookings', 'Total Earnings', 'Commission (10%)'];
    const csvContent = [
      headers.join(','),
      ...filteredEarnings.map(item =>
        [
          `${item.firstName} ${item.lastName}`,
          item.email,
          item.specialization,
          item.completedBookings,
          item.totalEarnings,
          item.commission
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nurse-earnings-${selectedMonth}.csv`;
    a.click();
  };

  const getMonthYear = () => {
    const [year, month] = selectedMonth.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading earnings data...</p>
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
            <h1>Nurse Earnings Report</h1>
            <p>Monitor and track nurse earnings by month</p>
          </div>
          <button className="export-btn" onClick={handleExportCSV} disabled={filteredEarnings.length === 0}>
            <Download size={20} />
            Export CSV
          </button>
        </div>

        {/* Summary Cards */}
        <div className="earnings-summary">
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#E8F5E9' }}>
              <DollarSign size={24} color="#4CAF50" />
            </div>
            <div className="summary-content">
              <p className="summary-label">Total Earnings</p>
              <h3>{formatCurrency(totalEarnings)}</h3>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#FCE4EC' }}>
              <TrendingUp size={24} color="#E91E63" />
            </div>
            <div className="summary-content">
              <p className="summary-label">Total Commission (10%)</p>
              <h3>{formatCurrency(totalCommission)}</h3>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#E3F2FD' }}>
              <Users size={24} color="#2196F3" />
            </div>
            <div className="summary-content">
              <p className="summary-label">Active Nurses</p>
              <h3>{filteredEarnings.filter(e => e.completedBookings > 0).length}</h3>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#FFF3E0' }}>
              <Calendar size={24} color="#FF9800" />
            </div>
            <div className="summary-content">
              <p className="summary-label">Period</p>
              <h3>{getMonthYear()}</h3>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="earnings-filters">
          <div className="filter-group">
            <label>Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-input"
            />
          </div>

          <div className="filter-group">
            <label>Search</label>
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select">
              <option value="earnings">Total Earnings</option>
              <option value="bookings">Completed Bookings</option>
              <option value="name">Nurse Name</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="form-select">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="earnings-section">
          {filteredEarnings.length === 0 ? (
            <div className="no-data-message">
              <p>No earnings data found for the selected period</p>
            </div>
          ) : (
            <div className="earnings-table-container">
              <table className="earnings-table">
                <thead>
                  <tr>
                    <th>Nurse Name</th>
                    <th>Email</th>
                    <th>Specialization</th>
                    <th>Hourly Rate</th>
                    <th>Completed Bookings</th>
                    <th>Total Earnings</th>
                    <th>Commission (10%)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEarnings.map(item => (
                    <tr key={item.nurseId} className={item.completedBookings === 0 ? 'inactive' : ''}>
                      <td>
                        <div className="nurse-name-cell">
                          <div className="nurse-avatar">
                            {item.firstName.charAt(0)}{item.lastName.charAt(0)}
                          </div>
                          <span>{item.firstName} {item.lastName}</span>
                        </div>
                      </td>
                      <td>{item.email}</td>
                      <td>{item.specialization}</td>
                      <td>{formatCurrency(item.hourlyRate)}</td>
                      <td>
                        <div className="bookings-cell">
                          <CheckCircle size={16} color="#4CAF50" />
                          <span>{item.completedBookings}</span>
                        </div>
                      </td>
                      <td className="earnings-value">
                        <strong>{formatCurrency(item.totalEarnings)}</strong>
                      </td>
                      <td className="commission-value">
                        {formatCurrency(item.commission)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredEarnings.length > 0 && (
          <div className="earnings-summary-footer">
            <div className="summary-item">
              <span className="label">Total Earnings (Filtered):</span>
              <span className="value">{formatCurrency(
                filteredEarnings.reduce((sum, item) => sum + (item.totalEarnings || 0), 0)
              )}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Commission (Filtered):</span>
              <span className="value">{formatCurrency(
                filteredEarnings.reduce((sum, item) => sum + (item.commission || 0), 0)
              )}</span>
            </div>
            <div className="summary-item">
              <span className="label">Showing:</span>
              <span className="value">{filteredEarnings.length} of {earnings.length} nurses</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminEarnings;
