import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Calendar, Clock, CheckCircle, 
  XCircle, Edit, Trash2, Eye, Download
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import './AdminBookings.css';

const AdminBookings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    
    fetchBookings();
  }, [navigate]);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:8080/api/bookings', config);
      setBookings(response.data);
      setFilteredBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.id.toString().includes(searchTerm) ||
        b.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.nurse && `${b.nurse.firstName} ${b.nurse.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
        b.serviceType?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleEditStatus = (booking) => {
    setSelectedBooking(booking);
    setEditStatus(booking.status);
    setShowEditModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !editStatus) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(
        `http://localhost:8080/api/bookings/${selectedBooking.id}/status`,
        { status: editStatus },
        config
      );

      // Refresh bookings
      await fetchBookings();
      setShowEditModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`http://localhost:8080/api/bookings/${bookingId}`, config);
      
      // Refresh bookings
      await fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

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
    return new Date(dateString).toLocaleString('en-US', {
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
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={`admin-dashboard-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {!sidebarOpen && <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>}
        <div className="admin-bookings-header">
          <div className="header-content">
            <div className="header-icon">
              <Calendar size={32} />
            </div>
            <div className="header-text">
              <h1>Manage Bookings</h1>
              <p>View and manage all booking appointments</p>
            </div>
          </div>
          <div className="header-decoration">
            <div className="decoration-circle circle-1"></div>
            <div className="decoration-circle circle-2"></div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by ID, patient, nurse, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <Filter size={20} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="results-count">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>

        {/* Bookings Table */}
        <div className="admin-content-card">
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Nurse</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">No bookings found</td>
                  </tr>
                ) : (
                  filteredBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.user?.username || 'N/A'}</td>
                      <td>
                        {booking.nurse 
                          ? `${booking.nurse.firstName} ${booking.nurse.lastName}` 
                          : 'N/A'}
                      </td>
                      <td>{booking.serviceType?.name || 'N/A'}</td>
                      <td>{formatDate(booking.bookingDateTime)}</td>
                      <td>{booking.duration}h</td>
                      <td>
                        <span className={getStatusBadgeClass(booking.status)}>
                          {booking.status}
                        </span>
                      </td>
                      <td>{formatCurrency(booking.estimatedCost)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view"
                            onClick={() => handleViewDetails(booking)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="action-btn edit"
                            onClick={() => handleEditStatus(booking)}
                            title="Edit Status"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeleteBooking(booking.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* View Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Booking ID:</span>
                <span className="detail-value">#{selectedBooking.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Patient:</span>
                <span className="detail-value">{selectedBooking.user?.username}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Patient Email:</span>
                <span className="detail-value">{selectedBooking.user?.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Nurse:</span>
                <span className="detail-value">
                  {selectedBooking.nurse 
                    ? `${selectedBooking.nurse.firstName} ${selectedBooking.nurse.lastName}` 
                    : 'N/A'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Service Type:</span>
                <span className="detail-value">{selectedBooking.serviceType?.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date & Time:</span>
                <span className="detail-value">{formatDate(selectedBooking.bookingDateTime)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{selectedBooking.duration} hours</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={getStatusBadgeClass(selectedBooking.status)}>
                  {selectedBooking.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estimated Cost:</span>
                <span className="detail-value">{formatCurrency(selectedBooking.estimatedCost)}</span>
              </div>
              {selectedBooking.finalCost && (
                <div className="detail-row">
                  <span className="detail-label">Final Cost:</span>
                  <span className="detail-value">{formatCurrency(selectedBooking.finalCost)}</span>
                </div>
              )}
              {selectedBooking.notes && (
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{selectedBooking.notes}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Created At:</span>
                <span className="detail-value">{formatDate(selectedBooking.createdAt)}</span>
              </div>
              {selectedBooking.updatedAt && (
                <div className="detail-row">
                  <span className="detail-label">Updated At:</span>
                  <span className="detail-value">{formatDate(selectedBooking.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {showEditModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Booking Status</h2>
              <button onClick={() => setShowEditModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <p>Update status for booking #{selectedBooking.id}</p>
              <div className="form-group">
                <label>Status:</label>
                <select 
                  value={editStatus} 
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateStatus} 
                  className="btn-primary"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
