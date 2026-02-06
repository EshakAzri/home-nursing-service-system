import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, User, Check, X, DollarSign } from 'lucide-react';
import './CustomerBookingHistory.css';

const CustomerBookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

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

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status?.toLowerCase() === filterStatus);

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
      <div className="booking-history-container">
        <div className="loading">Loading your booking history...</div>
      </div>
    );
  }

  return (
    <div className="booking-history-container">
      <div className="booking-history-header">
        <h1>My Bookings</h1>
        <p>View and manage your service bookings</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Bookings ({bookings.length})
        </button>
        <button 
          className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-tab ${filterStatus === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilterStatus('in-progress')}
        >
          In Progress
        </button>
        <button 
          className={`filter-tab ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          Completed
        </button>
        <button 
          className={`filter-tab ${filterStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterStatus('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No {filterStatus !== 'all' ? filterStatus : ''} bookings found</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className={`booking-card ${getStatusColor(booking.status)}`}>
              <div className="booking-card-header">
                <div className="booking-status">
                  <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    {booking.status || 'Pending'}
                  </span>
                </div>
                <div className="booking-id">#{booking.id}</div>
              </div>

              <div className="booking-card-body">
                <div className="booking-detail">
                  <Clock size={18} />
                  <div>
                    <span className="detail-label">Service Date</span>
                    <span className="detail-value">{formatDate(booking.bookingDateTime)}</span>
                  </div>
                </div>

                <div className="booking-detail">
                  <User size={18} />
                  <div>
                    <span className="detail-label">Service Type</span>
                    <span className="detail-value">{booking.serviceType?.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="booking-detail">
                  <MapPin size={18} />
                  <div>
                    <span className="detail-label">Nurse</span>
                    <span className="detail-value">
                      {booking.nurse ? `${booking.nurse.firstName} ${booking.nurse.lastName}` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="booking-detail">
                  <DollarSign size={18} />
                  <div>
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{booking.duration ? `${booking.duration} hour${booking.duration > 1 ? 's' : ''}` : 'N/A'}</span>
                  </div>
                </div>

                <div className="booking-detail">
                  <DollarSign size={18} />
                  <div>
                    <span className="detail-label">Estimated Cost</span>
                    <span className="detail-value">${booking.estimatedCost?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="booking-description">
                    <span className="detail-label">Notes</span>
                    <span className="detail-value">{booking.notes}</span>
                  </div>
                )}
              </div>

              <div className="booking-card-footer">
                <button className="btn-details">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerBookingHistory;
