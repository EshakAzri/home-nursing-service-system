import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, User, Check, X, DollarSign, Download, Filter, Search, Calendar, BookOpen, ChevronDown } from 'lucide-react';
import CustomerSidebar from './CustomerSidebar';
import './CustomerBookingHistory.css';

const CustomerBookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleActionSelect = (action, booking, selectRef) => {
    if (action === 'view') {
      handleViewDetails(booking);
    } else if (action === 'invoice') {
      handleDownloadInvoice(booking);
    }
    // Reset the select to default
    if (selectRef) {
      selectRef.value = '';
    }
  };

  const handleDownloadInvoice = async (booking) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No authentication token found. Please login again.');
        return;
      }

      console.log('Token exists:', token.substring(0, 20) + '...');
      let invoice = null;

      // First, try to get existing invoice
      try {
        console.log(`Attempting to fetch invoice for booking ${booking.id}...`);
        const response = await axios.get(`http://localhost:8080/api/invoices/booking/${booking.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        invoice = response.data;
        console.log('Invoice found:', invoice);
      } catch (err) {
        console.log('Error response status:', err.response?.status);
        console.log('Error response data:', err.response?.data);
        // If 404, no invoice exists yet, try to generate one
        if (err.response?.status === 404) {
          console.log('No invoice found, attempting to generate new one...');
        } else if (err.response?.status === 403) {
          // Permission denied - this booking doesn't belong to the user
          throw new Error(err.response?.data?.error || 'You do not have permission to access this invoice. This booking may not belong to you.');
        } else {
          throw err;
        }
      }

      // If no invoice exists, generate one
      if (!invoice) {
        console.log(`Generating new invoice for booking ${booking.id}...`);
        const generateResponse = await axios.post(`http://localhost:8080/api/invoices/generate/${booking.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        invoice = generateResponse.data;
        console.log('Invoice generated:', invoice);
      }

      // Create and download invoice as text file
      const invoiceText = generateInvoiceContent(booking, invoice);
      downloadInvoiceAsFile(invoiceText, invoice.invoiceNumber);
      console.log('Invoice downloaded successfully');
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Show appropriate error message
      let errorMessage = 'Failed to download invoice. Please try again.';
      if (error.response?.status === 403) {
        errorMessage = error.response?.data?.error || 'You do not have permission to access this invoice.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const generateInvoiceContent = (booking, invoice) => {
    const formatter = new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const bookingDate = formatter.format(new Date(booking.bookingDateTime));
    const issuedDate = formatter.format(new Date(invoice.issuedDate));
    const dueDate = formatter.format(new Date(invoice.dueDate));
    const invoiceType = booking.status?.toLowerCase() === 'completed' ? 'FINAL INVOICE' : 'ESTIMATED INVOICE';

    return `
================================================================================
                           HOME NURSING SERVICE
                              ${invoiceType}
================================================================================

Invoice Number: ${invoice.invoiceNumber}
Issued Date: ${issuedDate}
Due Date: ${dueDate}
Status: ${invoice.status}

================================================================================
CUSTOMER INFORMATION
================================================================================
Name: ${booking.user.username}
Email: ${booking.user.email}
Address: ${booking.user.address || 'Not provided'}

================================================================================
SERVICE DETAILS
================================================================================
Booking Date & Time: ${bookingDate}
Service Type: ${booking.serviceType?.name || 'N/A'}
Nurse: ${booking.nurse ? booking.nurse.firstName + ' ' + booking.nurse.lastName : 'Not Assigned'}
Specialization: ${booking.nurse?.specialization || 'N/A'}
Duration: ${booking.duration} hour(s)
Status: ${booking.status}
Notes: ${booking.notes || 'N/A'}

================================================================================
COST BREAKDOWN
================================================================================
Estimated Cost: RM${booking.estimatedCost?.toFixed(2) || '0.00'}
Final Cost: RM${invoice.amount?.toFixed(2) || '0.00'}

================================================================================
PAYMENT INFORMATION
================================================================================
Amount Due: RM${invoice.amount?.toFixed(2) || '0.00'}
Payment Status: ${invoice.status}

================================================================================
Thank you for using our service!
For inquiries, please contact our support team.
================================================================================
`;
  };

  const downloadInvoiceAsFile = (content, invoiceNumber) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${invoiceNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date & Time', 'Service Type', 'Nurse', 'Duration', 'Cost', 'Status', 'Notes'];
    const csvData = filteredBookings.map(booking => [
      booking.id,
      formatDate(booking.bookingDateTime),
      booking.serviceType?.name || 'N/A',
      booking.nurse ? `${booking.nurse.firstName} ${booking.nurse.lastName}` : 'Not Assigned',
      booking.duration ? `${booking.duration}h` : 'N/A',
      `RM${booking.estimatedCost?.toFixed(2) || '0.00'}`,
      booking.status || 'Pending',
      booking.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? token.substring(0, 20) + '...' : 'null');
        
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }
        
        const config = {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        console.log('Request config:', config);
        
        const response = await axios.get('http://localhost:8080/api/bookings/my-bookings', config);
        console.log('Response:', response.data);
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Full error object:', err);
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response?.status === 403) {
          setError('You do not have permission to access this resource.');
        } else {
          setError('Failed to load booking history: ' + (err.response?.data?.error || err.message));
        }
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'in-progress':
        return 'status-in-progress';
      default:
        return 'status-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Check size={16} />;
      case 'cancelled':
        return <X size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Status filter
      if (filterStatus !== 'all' && booking.status?.toLowerCase() !== filterStatus) {
        return false;
      }

      // Date range filter
      if (dateFrom) {
        const bookingDate = new Date(booking.bookingDateTime);
        const fromDate = new Date(dateFrom);
        if (bookingDate < fromDate) return false;
      }

      if (dateTo) {
        const bookingDate = new Date(booking.bookingDateTime);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        if (bookingDate > toDate) return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const nurseName = booking.nurse ? `${booking.nurse.firstName} ${booking.nurse.lastName}`.toLowerCase() : '';
        const serviceType = booking.serviceType?.name?.toLowerCase() || '';
        const id = booking.id.toString();
        
        return nurseName.includes(search) || serviceType.includes(search) || id.includes(search);
      }

      return true;
    });
  }, [bookings, filterStatus, dateFrom, dateTo, searchTerm]);

  const clearFilters = () => {
    setFilterStatus('all');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="customer-layout">
        <CustomerSidebar onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className="customer-main">
          <div className="booking-history-container">
            <div className="loading">Loading your booking history...</div>
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
        <div className="booking-history-container">
      <div className="booking-history-header">
        <div className="header-left">
          <div className="header-icon-title">
            <div className="header-icon">
              <BookOpen size={28} />
            </div>
            <div>
              <h1>My Bookings</h1>
              <p>View and manage your service bookings</p>
            </div>
          </div>
        </div>
        <button className="btn-export" onClick={exportToCSV} disabled={filteredBookings.length === 0}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button className="btn-toggle-filters" onClick={() => setShowFilters(!showFilters)}>
        <Filter size={16} />
        <span>Filters</span>
        <ChevronDown size={16} className={`chevron ${showFilters ? 'open' : ''}`} />
      </button>

      <div className={`filters-section ${showFilters ? 'open' : 'closed'}`}>
        <div className="filters-container">
          <div className="filter-group">
            <label><Filter size={16} /> Status</label>
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status ({bookings.length})</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label><Calendar size={16} /> From Date</label>
            <input 
              type="date"
              className="filter-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label><Calendar size={16} /> To Date</label>
            <input 
              type="date"
              className="filter-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="filter-group filter-search">
            <label><Search size={16} /> Search</label>
            <input 
              type="text"
              className="filter-input"
              placeholder="Search by nurse, service, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="btn-clear-filters" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        <div className="results-info">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No {filterStatus !== 'all' ? filterStatus : ''} bookings found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date & Time</th>
                <th>Service Type</th>
                <th>Nurse</th>
                <th>Duration</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td data-label="ID">
                    <span className="booking-id-badge">{booking.id}</span>
                  </td>
                  <td data-label="Date & Time">
                    <div className="date-cell">
                      <span>{formatDate(booking.bookingDateTime)}</span>
                    </div>
                  </td>
                  <td data-label="Service Type">
                    <div className="service-cell">
                      <span>{booking.serviceType?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td data-label="Nurse">
                    <div className="nurse-cell">
                      <div>
                        <span>{booking.nurse ? `${booking.nurse.firstName} ${booking.nurse.lastName}` : 'Not Assigned'}</span><br></br>
                        {booking.nurse?.specialization && (
                          <span className="nurse-specialization">{booking.nurse.specialization}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td data-label="Duration">
                    <span className="duration-badge">
                      {booking.duration ? `${booking.duration}h` : 'N/A'}
                    </span>
                  </td>
                  <td data-label="Cost">
                    <div className="cost-cell">
                      <span className="cost-amount">RM{booking.estimatedCost?.toFixed(2) || '0.00'}</span>
                    </div>
                  </td>
                  <td data-label="Status">
                    <span className={`status-badge ${getStatusColor(booking.status)}`}>
                      {booking.status || 'Pending'}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <select 
                      className="action-select"
                      onChange={(e) => {
                        handleActionSelect(e.target.value, booking);
                        e.target.value = '';
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Select Action</option>
                      <option value="view">View Details</option>
                      <option value="invoice">Download Invoice</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Booking ID:</span>
                <span className="detail-value">{selectedBooking.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date & Time:</span>
                <span className="detail-value">{formatDate(selectedBooking.bookingDateTime)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Service Type:</span>
                <span className="detail-value">{selectedBooking.serviceType?.name || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Nurse:</span>
                <span className="detail-value">
                  {selectedBooking.nurse ? `${selectedBooking.nurse.firstName} ${selectedBooking.nurse.lastName}` : 'Not Assigned'}
                </span>
              </div>
              {selectedBooking.nurse?.specialization && (
                <div className="detail-row">
                  <span className="detail-label">Specialization:</span>
                  <span className="detail-value">{selectedBooking.nurse.specialization}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{selectedBooking.duration ? `${selectedBooking.duration}h` : 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cost:</span>
                <span className="detail-value">RM{selectedBooking.estimatedCost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status-badge ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status || 'Pending'}
                </span>
              </div>
              {selectedBooking.notes && (
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{selectedBooking.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingHistory;
