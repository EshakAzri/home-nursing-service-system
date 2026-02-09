import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, User, Check, X, DollarSign, Filter, Search, Calendar, FileText, AlertCircle, Briefcase, Activity, Eye } from 'lucide-react';
import NurseSidebar from './NurseSidebar';
import './NurseAssignments.css';

const NurseAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    fetchAssignments();
  }, [navigate]);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.get('http://localhost:8080/api/bookings/nurse-assignments', config);
      setAssignments(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to load assignments: ' + (err.response?.data?.error || err.message));
      }
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      setActionError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(`http://localhost:8080/api/bookings/${bookingId}/accept`, {}, config);
      
      // Update the assignment in state
      setAssignments(assignments.map(a => a.id === bookingId ? response.data : a));
      setActionLoading(null);
    } catch (err) {
      console.error('Error accepting booking:', err);
      setActionError(err.response?.data?.error || 'Failed to accept booking');
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      setActionError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(`http://localhost:8080/api/bookings/${bookingId}/reject`, {}, config);
      
      // Update the assignment in state
      setAssignments(assignments.map(a => a.id === bookingId ? response.data : a));
      setActionLoading(null);
    } catch (err) {
      console.error('Error rejecting booking:', err);
      setActionError(err.response?.data?.error || 'Failed to reject booking');
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      setActionError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {}, config);
      
      // Update the assignment in state
      setAssignments(assignments.map(a => a.id === bookingId ? response.data : a));
      setActionLoading(null);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setActionError(err.response?.data?.error || 'Failed to cancel booking');
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'status-completed';
      case 'PENDING':
        return 'status-pending';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'CONFIRMED':
        return 'status-confirmed';
      default:
        return 'status-default';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    // Status filter
    if (filterStatus !== 'all' && assignment.status?.toUpperCase() !== filterStatus.toUpperCase()) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const patientName = assignment.user?.username?.toLowerCase() || '';
      const serviceType = assignment.serviceType?.name?.toLowerCase() || '';
      const id = assignment.id.toString();
      
      return patientName.includes(search) || serviceType.includes(search) || id.includes(search);
    }

    return true;
  });

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

  const handleViewDetails = (assignment) => {
    setSelectedAssignment(assignment);
    setShowModal(true);
  };

  const getGoogleMapsLink = (address) => {
    if (!address) return '#';
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/${encodedAddress}`;
  };

  const getWazeLink = (address) => {
    if (!address) return '#';
    const encodedAddress = encodeURIComponent(address);
    return `https://waze.com/ul?q=${encodedAddress}`;
  };

  if (loading) {
    return (
      <div className="nurse-layout">
        <NurseSidebar onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className="nurse-main">
          <div className="assignments-container">
            <div className="loading">Loading your assignments...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nurse-layout">
      <NurseSidebar onLogout={handleLogout} isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className={`nurse-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        {!sidebarOpen && <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>}
        <div className="assignments-container">
          <div className="assignments-header">
            <div className="header-left">
              <h1><Briefcase size={28} style={{ marginRight: '0.5rem', display: 'inline', marginTop: '-2px', verticalAlign: 'middle' }} /> My Assignments</h1>
              <p><Activity size={16} style={{ marginRight: '0.35rem' }} />View and manage your patient assignments</p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {actionError && <div className="error-message"><AlertCircle size={16} /> {actionError}</div>}

          <div className="filters-section">
            <div className="filters-container">
              <div className="filter-group">
                <label><Filter size={16} /> Status</label>
                <select 
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status ({assignments.length})</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="filter-group filter-search">
                <label><Search size={16} /> Search</label>
                <input 
                  type="text"
                  className="filter-input"
                  placeholder="Search by patient, service, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="results-info">
              Showing {filteredAssignments.length} of {assignments.length} assignments
            </div>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="no-assignments">
              <p>No {filterStatus !== 'all' ? filterStatus : ''} assignments found</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>NO</th>
                    <th>Date & Time</th>
                    <th>Patient</th>
                    <th>Service Type</th>
                    <th>Duration</th>
                    <th>Your Earning</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment, index) => (
                    <tr key={assignment.id}>
                      <td data-label="NO">
                        <span className="assignment-id-badge">{index + 1}</span>
                      </td>
                      <td data-label="Date & Time">
                        <div className="date-cell">
                          <span>{formatDate(assignment.bookingDateTime)}</span>
                        </div>
                      </td>
                      <td data-label="Patient">
                        <div className="patient-cell">
                          <User size={16} />
                          <span>{assignment.user?.username || 'N/A'}</span>
                        </div>
                      </td>
                      <td data-label="Service Type">
                        <div className="service-cell">
                          <span>{assignment.serviceType?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td data-label="Duration">
                        <span className="duration-badge">
                          {assignment.duration ? `${assignment.duration}h` : 'N/A'}
                        </span>
                      </td>
                      <td data-label="Your Earning">
                        <div className="fee-cell">
                          <span className="fee-amount">RM{((assignment.nurseRate || 0) * (assignment.duration || 0)).toFixed(2)}</span>
                        </div>
                      </td>
                      <td data-label="Status">
                        <span className={`status-badge ${getStatusColor(assignment.status)}`}>
                          {assignment.status || 'Pending'}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <div className="action-buttons">
                          {assignment.status === 'PENDING' ? (
                            <>
                              <button 
                                className="btn-accept"
                                onClick={() => handleAcceptBooking(assignment.id)}
                                disabled={actionLoading === assignment.id}
                                title="Accept this booking"
                              >
                                <Check size={16} />
                                {actionLoading === assignment.id ? 'Processing...' : 'Accept'}
                              </button>
                              <button 
                                className="btn-reject"
                                onClick={() => handleRejectBooking(assignment.id)}
                                disabled={actionLoading === assignment.id}
                                title="Reject this booking"
                              >
                                <X size={16} />
                                {actionLoading === assignment.id ? 'Processing...' : 'Reject'}
                              </button>
                            </>
                          ) : assignment.status === 'CONFIRMED' ? (
                            <>
                              <button 
                                className="btn-view-details"
                                onClick={() => handleViewDetails(assignment)}
                                title="View booking details and address"
                              >
                                <Eye size={16} />
                                View Details
                              </button>
                              <button 
                                className="btn-cancel"
                                onClick={() => handleCancelBooking(assignment.id)}
                                disabled={actionLoading === assignment.id}
                                title="Cancel this booking"
                              >
                                <X size={16} />
                                {actionLoading === assignment.id ? 'Processing...' : 'Cancel'}
                              </button>
                            </>
                          ) : (
                            <span className="no-actions">No actions available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedAssignment && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Patient Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Patient Name:</span>
                  <span className="detail-value">{selectedAssignment.user?.username || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Contact:</span>
                  <span className="detail-value">{selectedAssignment.user?.phoneNumber || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Service Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Service Type:</span>
                  <span className="detail-value">{selectedAssignment.serviceType?.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date & Time:</span>
                  <span className="detail-value">{formatDate(selectedAssignment.bookingDateTime)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{selectedAssignment.duration ? `${selectedAssignment.duration}h` : 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Your Earning:</span>
                  <span className="detail-value">RM{((selectedAssignment.nurseRate || 0) * (selectedAssignment.duration || 0)).toFixed(2)}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Address Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{selectedAssignment.user?.address || 'No address provided'}</span>
                </div>
                {selectedAssignment.user?.address && (
                  <div className="address-navigation">
                    <a 
                      href={getGoogleMapsLink(selectedAssignment.user.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-button nav-maps"
                      title="Open in Google Maps"
                    >
                      <MapPin size={16} />
                      Google Maps
                    </a>
                    <a 
                      href={getWazeLink(selectedAssignment.user.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-button nav-waze"
                      title="Open in Waze"
                    >
                      <MapPin size={16} />
                      Waze
                    </a>
                  </div>
                )}
              </div>

              {selectedAssignment.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <div className="detail-row">
                    <span className="detail-value">{selectedAssignment.notes}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseAssignments;
