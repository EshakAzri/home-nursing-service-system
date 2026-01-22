import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  User, Calendar, Clock, MapPin, DollarSign, FileText,
  UserCheck, Loader2, CheckCircle, XCircle, LogOut,
  ArrowRight, Users, Stethoscope
} from 'lucide-react';
import CustomerSidebar from './CustomerSidebar';
import './CustomerBookingPage.css';

const CustomerBookingPage = () => {
  const [formData, setFormData] = useState({
    branchId: '',
    nurseId: '',
    bookingDate: '',
    bookingTime: '',
    serviceType: '',
    duration: '',
    estimatedCost: '',
    notes: ''
  });
  const [branches, setBranches] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [filteredNurses, setFilteredNurses] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setFetchLoading(true);
        const [nursesRes, serviceTypesRes, branchesRes] = await Promise.all([
          axios.get('http://localhost:8080/api/nurses'),
          axios.get('http://localhost:8080/api/service-types'),
          axios.get('http://localhost:8080/api/branches')
        ]);
        console.log('Fetched nurses:', nursesRes.data);
        console.log('Fetched service types:', serviceTypesRes.data);
        console.log('Fetched branches:', branchesRes.data);
        setNurses(nursesRes.data);
        setServiceTypes(serviceTypesRes.data);
        setBranches(branchesRes.data);
      } catch (error) {
        console.log('Error fetching data:', error.response || error);
        setMessage({
          text: 'Failed to load data. Please try refreshing the page.',
          title: 'Data Loading Error',
          type: 'error'
        });
        setShowModal(true);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [token, navigate]);

  // Filter nurses based on selected branch AND service type using service configurations
  useEffect(() => {
    const filterNurses = async () => {
      if (formData.branchId && formData.serviceType) {
        try {
          const response = await axios.get('http://localhost:8080/api/nurses/available', {
            params: {
              serviceTypeId: formData.serviceType,
              branchId: formData.branchId
            },
            headers: { Authorization: `Bearer ${token}` }
          });
          setFilteredNurses(response.data);
          // Reset nurse selection if current nurse is not in the filtered list
          if (formData.nurseId && !response.data.find(n => n.id === parseInt(formData.nurseId))) {
            setFormData(prev => ({ ...prev, nurseId: '' }));
          }
        } catch (error) {
          console.error('Error fetching available nurses:', error);
          setFilteredNurses([]);
          setFormData(prev => ({ ...prev, nurseId: '' }));
        }
      } else {
        setFilteredNurses([]);
        setFormData(prev => ({ ...prev, nurseId: '' }));
      }
    };

    filterNurses();
  }, [formData.branchId, formData.serviceType, token]);

  // Auto-calculate estimated cost
  useEffect(() => {
    const calculateCost = () => {
      const serviceType = serviceTypes.find(st => st.id === parseInt(formData.serviceType));
      const nurse = nurses.find(n => n.id === parseInt(formData.nurseId));
      const duration = parseFloat(formData.duration);

      if (serviceType && nurse && duration && duration > 0) {
        // Base cost = service price per hour * duration
        const baseCost = serviceType.basePricePerHour * duration;
        
        // Nurse hourly rate * duration
        const nurseCost = nurse.hourlyRate * duration;
        
        // Total cost (fuel charge not included)
        const totalCost = baseCost + nurseCost;
        
        setFormData(prev => ({ 
          ...prev, 
          estimatedCost: totalCost.toFixed(2) 
        }));
      } else {
        setFormData(prev => ({ ...prev, estimatedCost: '' }));
      }
    };

    calculateCost();
  }, [formData.serviceType, formData.nurseId, formData.duration, serviceTypes, nurses]);

  const validateField = (name, value) => {
    const errors = {};

    if (!value || value.trim() === '') {
      switch (name) {
        case 'branchId':
          errors.branchId = 'Please select a branch';
          break;
        case 'nurseId':
          errors.nurseId = 'Please select a nurse';
          break;
        case 'bookingDate':
          errors.bookingDate = 'Booking date is required';
          break;
        case 'bookingTime':
          errors.bookingTime = 'Booking time is required';
          break;
        case 'serviceType':
          errors.serviceType = 'Service type is required';
          break;
        case 'duration':
          errors.duration = 'Duration is required';
          break;
        default:
          break;
      }
    }

    if (name === 'duration' && value && (isNaN(value) || parseFloat(value) <= 0)) {
      errors.duration = 'Please enter a valid duration greater than 0';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const errors = validateField(name, value);
      setFormErrors(prev => ({ ...prev, [name]: errors[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const errors = validateField(name, formData[name]);
    setFormErrors(prev => ({ ...prev, [name]: errors[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(key => {
      const fieldErrors = validateField(key, formData[key]);
      if (fieldErrors[key]) errors[key] = fieldErrors[key];
    });

    if (Object.keys(errors).length > 0) {
      setMessage({
        text: 'Please fill in all required fields correctly.',
        title: 'Validation Error',
        type: 'error'
      });
      setShowModal(true);
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await axios.post('http://localhost:8080/api/bookings', {
        nurse: { id: parseInt(formData.nurseId) },
        bookingDate: formData.bookingDate,
        bookingTime: formData.bookingTime,
        serviceType: formData.serviceType,
        duration: parseFloat(formData.duration),
        estimatedCost: parseFloat(formData.estimatedCost),
        notes: formData.notes
      }, { headers: { Authorization: `Bearer ${token}` } });

      setMessage({
        text: 'Booking created successfully! You will be redirected shortly.',
        title: 'Success!',
        type: 'success'
      });
      setShowModal(true);

      setFormData({
        branchId: '', nurseId: '', bookingDate: '', bookingTime: '', 
        serviceType: '', duration: '', estimatedCost: '', notes: ''
      });
      setTouched({});

      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    } catch (error) {
      let errorMsg = 'Failed to create booking. Please try again.';
      let errorTitle = 'Booking Error';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          errorMsg = data.message || 'Please check your booking details and try again.';
          errorTitle = 'Invalid Booking Data';
        } else if (status === 401) {
          errorMsg = 'Your session has expired. Please login again.';
          errorTitle = 'Authentication Error';
          setTimeout(() => {
            handleLogout();
          }, 2000);
        } else if (status === 403) {
          errorMsg = 'You do not have permission to create bookings.';
          errorTitle = 'Permission Denied';
        } else if (status >= 500) {
          errorMsg = 'Server error occurred. Please try again later.';
          errorTitle = 'Server Error';
        }
      } else if (error.code === 'NETWORK_ERROR') {
        errorMsg = 'Unable to connect to the server. Please check your internet connection.';
        errorTitle = 'Connection Error';
      }

      setMessage({
        text: errorMsg,
        title: errorTitle,
        type: 'error'
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

    if (fetchLoading) {
    return (
      <div className="customer-layout">
        <CustomerSidebar onLogout={handleLogout} />
        <div className="customer-main">
          <div className="booking-loading">
            <Loader2 className="spinner" size={48} />
            <p>Loading booking data...</p>
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
        <div className="booking-container">
          {/* Background elements */}
          <div className="booking-blob1"></div>
          <div className="booking-blob2"></div>
          <div className="booking-blob3"></div>

          <div className="booking-card">
        <div className="booking-header">
          <div className="booking-logo-container">
            <div className="booking-logo">
              <UserCheck size={24} color="#ffffff" />
            </div>
            <span className="booking-logo-text">CareLink</span>
          </div>
          <h1 className="booking-title">Book Home Nursing Service</h1>
          <p className="booking-subtitle">
            Step 1: Choose location → Step 2: Select service → Step 3: Pick qualified nurse → Auto pricing
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="booking-form-grid">
            {/* Branch Selection - First Step */}
            <div className="booking-form-group full-width">
              <label className="booking-label">🏥 Select Branch</label>
              <div className="booking-select-wrapper">
                <MapPin className="booking-select-icon" size={18} />
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`booking-select ${formErrors.branchId && touched.branchId ? 'error' : ''}`}
                  required
                >
                  <option value="">Choose a branch location</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} - {branch.city}, {branch.state}
                    </option>
                  ))}
                </select>
              </div>
              {formErrors.branchId && touched.branchId && (
                <span className="booking-error-text">{formErrors.branchId}</span>
              )}
            </div>

            {/* Service Type Selection - Second Step */}
            <div className="booking-form-group full-width">
              <label className="booking-label">🩺 Select Service Type</label>
              <div className="booking-select-wrapper">
                <MapPin className="booking-select-icon" size={18} />
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`booking-select ${formErrors.serviceType && touched.serviceType ? 'error' : ''}`}
                  required
                >
                  <option value="">Choose service type</option>
                  {serviceTypes.map(serviceType => (
                    <option key={serviceType.id} value={serviceType.id}>
                      {serviceType.name} - RM{serviceType.basePricePerHour}/hour ({serviceType.estimatedDurationHours}hrs estimated)
                    </option>
                  ))}
                </select>
              </div>
              {formErrors.serviceType && touched.serviceType && (
                <span className="booking-error-text">{formErrors.serviceType}</span>
              )}
            </div>

            {/* Nurse Selection - Based on Branch AND Service Type */}
            <div className="booking-form-group full-width">
              <label className="booking-label">👩‍⚕️ Select Nurse</label>
              <div className="booking-select-wrapper">
                <Stethoscope className="booking-select-icon" size={18} />
                <select
                  name="nurseId"
                  value={formData.nurseId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`booking-select ${formErrors.nurseId && touched.nurseId ? 'error' : ''}`}
                  disabled={!formData.branchId || !formData.serviceType}
                  required
                >
                  <option value="">
                    {!formData.branchId ? 'Please select branch first' : 
                     !formData.serviceType ? 'Please select service type first' : 
                     filteredNurses.length === 0 ? 'No nurses available for this service' :
                     'Choose a nurse'}
                  </option>
                  {filteredNurses.map(nurse => (
                    <option key={nurse.id} value={nurse.id}>
                      {nurse.firstName} {nurse.lastName} - {nurse.specialization} (RM{nurse.hourlyRate}/hr)
                    </option>
                  ))}
                </select>
              </div>
              {formErrors.nurseId && touched.nurseId && (
                <span className="booking-error-text">{formErrors.nurseId}</span>
              )}
            </div>
          </div>

          <div className="booking-form-grid">
            <div className="booking-form-group">
              <label className="booking-label">Booking Date</label>
              <div className="booking-input-wrapper">
                <Calendar className="booking-input-icon" size={18} />
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`booking-input ${formErrors.bookingDate && touched.bookingDate ? 'error' : ''}`}
                  required
                />
              </div>
              {formErrors.bookingDate && touched.bookingDate && (
                <span className="booking-error-text">{formErrors.bookingDate}</span>
              )}
            </div>

            <div className="booking-form-group">
              <label className="booking-label">Booking Time</label>
              <div className="booking-input-wrapper">
                <Clock className="booking-input-icon" size={18} />
                <input
                  type="time"
                  name="bookingTime"
                  value={formData.bookingTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`booking-input ${formErrors.bookingTime && touched.bookingTime ? 'error' : ''}`}
                  required
                />
              </div>
              {formErrors.bookingTime && touched.bookingTime && (
                <span className="booking-error-text">{formErrors.bookingTime}</span>
              )}
            </div>

            <div className="booking-form-group">
              <label className="booking-label">Duration (hours)</label>
              <div className="booking-input-wrapper">
                <Clock className="booking-input-icon" size={18} />
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`booking-input ${formErrors.duration && touched.duration ? 'error' : ''}`}
                  min="0.5"
                  step="0.5"
                  placeholder="e.g., 2.5"
                  required
                />
              </div>
              {formErrors.duration && touched.duration && (
                <span className="booking-error-text">{formErrors.duration}</span>
              )}
            </div>
          </div>

          <div className="booking-form-group">
            <label className="booking-label">💰 Estimated Cost (Auto-calculated)</label>
            <div className="booking-input-wrapper">
              <DollarSign className="booking-input-icon" size={18} />
              <input
                type="text"
                name="estimatedCost"
                value={formData.estimatedCost ? `RM ${formData.estimatedCost}` : 'Select service details to calculate'}
                readOnly
                className="booking-input readonly"
                placeholder="Auto-calculated based on service and duration"
              />
            </div>
            {formData.estimatedCost && (
              <div className="cost-breakdown">
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Includes service fee and nurse hourly rate. Fuel charge not included.
                </small>
              </div>
            )}
          </div>

          <div className="booking-form-group">
            <label className="booking-label">Additional Notes</label>
            <textarea
              name="notes"
              placeholder="Any special requirements or notes..."
              value={formData.notes}
              onChange={handleChange}
              className="booking-textarea"
              rows="3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="booking-button"
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                <span style={{ marginLeft: '8px' }}>Creating Booking...</span>
              </>
            ) : (
              <>
                <span>Book Service</span>
                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Modal Popup */}
      {showModal && message.text && (
        <div className="booking-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`booking-modal-content ${message.type}`}>
              <div className="booking-modal-icon">
                {message.type === 'success' ?
                  <CheckCircle size={48} color="#166534" /> :
                  <XCircle size={48} color="#dc2626" />
                }
              </div>
              <h3 className="booking-modal-title">
                {message.type === 'success' ? 'Success!' : (message.title || 'Error')}
              </h3>
              <p className="booking-modal-message">{message.text}</p>
              <button
                className="booking-modal-close"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
    </div>
  );
};

export default CustomerBookingPage;