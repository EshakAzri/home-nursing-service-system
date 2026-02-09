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

const FUEL_COST = 10.00; // Fixed fuel charge in RM

const CustomerBookingPage = () => {
  const [formData, setFormData] = useState({
    branchId: '',
    nurseId: '',
    bookingDate: '',
    bookingTime: '',
    serviceType: '',
    duration: '',
    estimatedCost: '',
    fuelCost: FUEL_COST,
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nurseFilterLoading, setNurseFilterLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
        setNurseFilterLoading(true);
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
        } finally {
          setNurseFilterLoading(false);
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
        
        // Total cost including fuel charge
        const totalCost = baseCost + nurseCost + FUEL_COST;
        
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

    if (name === 'duration' && value && (isNaN(value) || parseFloat(value) <= 0 || ![1,2,3,4,5].includes(parseInt(value)))) {
      errors.duration = 'Please select a valid duration (1-5 hours)';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Update current step based on selections
    if (name === 'branchId' && value) setCurrentStep(Math.max(currentStep, 2));
    if (name === 'serviceType' && value) setCurrentStep(Math.max(currentStep, 3));
    if (name === 'nurseId' && value) setCurrentStep(Math.max(currentStep, 4));

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

  const validateDateTime = () => {
    const selectedDate = new Date(formData.bookingDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    // Check if date is in the past
    if (selectedDay < today) {
      return 'Booking date cannot be in the past';
    }

    // If booking is today, check if time is in the past
    if (selectedDay.getTime() === today.getTime() && formData.bookingTime) {
      const [hours, minutes] = formData.bookingTime.split(':');
      const selectedDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      if (selectedDateTime < now) {
        return 'Booking time cannot be in the past';
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(key => {
      const fieldErrors = validateField(key, formData[key]);
      if (fieldErrors[key]) errors[key] = fieldErrors[key];
    });

    // Validate date and time
    const dateTimeError = validateDateTime();
    if (dateTimeError) {
      errors.bookingDate = dateTimeError;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setMessage({
        text: dateTimeError || 'Please fill in all required fields correctly.',
        title: 'Validation Error',
        type: 'error'
      });
      setShowModal(true);
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmBooking = async () => {
    setShowConfirmModal(false);

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await axios.post('http://localhost:8080/api/bookings', {
        nurse: { id: parseInt(formData.nurseId) },
        bookingDate: formData.bookingDate,
        bookingTime: formData.bookingTime,
        serviceType: parseInt(formData.serviceType),
        duration: parseFloat(formData.duration),
        estimatedCost: parseFloat(formData.estimatedCost),
        fuelCost: FUEL_COST,
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
        serviceType: '', duration: '', estimatedCost: '', fuelCost: FUEL_COST, notes: ''
      });
      setTouched({});
      setCurrentStep(1);

      setTimeout(() => {
        setShowModal(false);
        navigate('/customer/bookings');
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error, error.response?.data);
      let errorMsg = 'Failed to create booking. Please try again.';
      let errorTitle = 'Booking Error';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          errorMsg = data.error || data.message || 'Please check your booking details and try again.';
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

  const getSelectedBranch = () => branches.find(b => b.id === parseInt(formData.branchId));
  const getSelectedServiceType = () => serviceTypes.find(st => st.id === parseInt(formData.serviceType));
  const getSelectedNurse = () => nurses.find(n => n.id === parseInt(formData.nurseId));

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
          
          {/* Progress Indicator */}
          <div className="booking-progress">
            <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="progress-circle">1</div>
              <span className="progress-label">Branch</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="progress-circle">2</div>
              <span className="progress-label">Service</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
              <div className="progress-circle">3</div>
              <span className="progress-label">Nurse</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
              <div className="progress-circle">4</div>
              <span className="progress-label">Details</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="booking-layout">
            <div className="booking-form-section">
          <div className="booking-form-grid">
            {/* Branch Selection - First Step */}
            <div className="booking-form-group full-width">
              <label className="booking-label required">Select Branch</label>
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
              <label className="booking-label required">Select Service Type</label>
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
              <label className="booking-label required">Select Nurse</label>
              <div className="booking-select-wrapper">
                <Stethoscope className="booking-select-icon" size={18} />
                {nurseFilterLoading && <Loader2 className="spinner-small" size={16} />}
                <select
                  name="nurseId"
                  value={formData.nurseId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`booking-select ${formErrors.nurseId && touched.nurseId ? 'error' : ''}`}
                  disabled={!formData.branchId || !formData.serviceType || nurseFilterLoading}
                  required
                >
                  <option value="">
                    {nurseFilterLoading ? 'Loading available nurses...' :
                     !formData.branchId ? 'Please select branch first' : 
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
              <label className="booking-label required">Booking Date</label>
              <div className="booking-input-wrapper">
                <Calendar className="booking-input-icon" size={18} />
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={getTodayDate()}
                  className={`booking-input ${formErrors.bookingDate && touched.bookingDate ? 'error' : ''}`}
                  required
                />
              </div>
              {formErrors.bookingDate && touched.bookingDate && (
                <span className="booking-error-text">{formErrors.bookingDate}</span>
              )}
            </div>

            <div className="booking-form-group">
              <label className="booking-label required">Booking Time</label>
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
              <label className="booking-label required">Duration (hours)</label>
              <div className="booking-select-wrapper">
                <Clock className="booking-select-icon" size={18} />
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`booking-select ${formErrors.duration && touched.duration ? 'error' : ''}`}
                  required
                >
                  <option value="">Select duration</option>
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="5">5 hours</option>
                </select>
              </div>
              {formErrors.duration && touched.duration && (
                <span className="booking-error-text">{formErrors.duration}</span>
              )}
            </div>
          </div>

          <div className="booking-form-group">
            <label className="booking-label">Estimated Cost (Auto-calculated)</label>
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
            {formData.estimatedCost && getSelectedServiceType() && getSelectedNurse() && formData.duration && (
              <div className="cost-breakdown-detailed">
                <div className="cost-item">
                  <span>Service Fee:</span>
                  <span>RM {(getSelectedServiceType().basePricePerHour * parseFloat(formData.duration)).toFixed(2)}</span>
                </div>
                <div className="cost-item">
                  <span>Nurse Rate ({getSelectedNurse().hourlyRate}/hr × {formData.duration}hr):</span>
                  <span>RM {(getSelectedNurse().hourlyRate * parseFloat(formData.duration)).toFixed(2)}</span>
                </div>
                <div className="cost-item">
                  <span>Fuel Charge:</span>
                  <span>RM {FUEL_COST.toFixed(2)}</span>
                </div>
                <div className="cost-item total">
                  <span><strong>Total:</strong></span>
                  <span><strong>RM {formData.estimatedCost}</strong></span>
                </div>
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
                <span>Review & Book Service</span>
                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </div>

        {/* Booking Summary Card */}
        <div className="booking-summary-card">
          <h3 className="summary-title">Booking Summary</h3>
          <div className="summary-content">
            {formData.branchId ? (
              <div className="summary-item">
                <MapPin size={16} className="summary-icon" />
                <div>
                  <div className="summary-label">Branch</div>
                  <div className="summary-value">{getSelectedBranch()?.name}</div>
                </div>
              </div>
            ) : (
              <div className="summary-placeholder">Select branch to begin</div>
            )}

            {formData.serviceType && (
              <div className="summary-item">
                <Stethoscope size={16} className="summary-icon" />
                <div>
                  <div className="summary-label">Service Type</div>
                  <div className="summary-value">{getSelectedServiceType()?.name}</div>
                </div>
              </div>
            )}

            {formData.nurseId && (
              <div className="summary-item">
                <UserCheck size={16} className="summary-icon" />
                <div>
                  <div className="summary-label">Nurse</div>
                  <div className="summary-value">
                    {getSelectedNurse()?.firstName} {getSelectedNurse()?.lastName}
                  </div>
                  <div className="summary-sublabel">{getSelectedNurse()?.specialization}</div>
                </div>
              </div>
            )}

            {formData.bookingDate && (
              <div className="summary-item">
                <Calendar size={16} className="summary-icon" />
                <div>
                  <div className="summary-label">Date & Time</div>
                  <div className="summary-value">
                    {new Date(formData.bookingDate).toLocaleDateString('en-MY', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  {formData.bookingTime && (
                    <div className="summary-sublabel">{formData.bookingTime}</div>
                  )}
                </div>
              </div>
            )}

            {formData.duration && (
              <div className="summary-item">
                <Clock size={16} className="summary-icon" />
                <div>
                  <div className="summary-label">Duration</div>
                  <div className="summary-value">{formData.duration} hour(s)</div>
                </div>
              </div>
            )}

            {formData.estimatedCost && (
              <div className="summary-item-cost">
                <DollarSign size={20} className="summary-icon" />
                <div>
                  <div className="summary-label">Total Cost</div>
                  <div className="summary-cost">RM {formData.estimatedCost}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="booking-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="booking-modal confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="booking-modal-content">
              <h3 className="booking-modal-title">Confirm Your Booking</h3>
              <div className="confirmation-details">
                <div className="confirm-row">
                  <strong>Branch:</strong>
                  <span>{getSelectedBranch()?.name}</span>
                </div>
                <div className="confirm-row">
                  <strong>Service:</strong>
                  <span>{getSelectedServiceType()?.name}</span>
                </div>
                <div className="confirm-row">
                  <strong>Nurse:</strong>
                  <span>{getSelectedNurse()?.firstName} {getSelectedNurse()?.lastName}</span>
                </div>
                <div className="confirm-row">
                  <strong>Date:</strong>
                  <span>{new Date(formData.bookingDate).toLocaleDateString('en-MY', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}</span>
                </div>
                <div className="confirm-row">
                  <strong>Time:</strong>
                  <span>{formData.bookingTime}</span>
                </div>
                <div className="confirm-row">
                  <strong>Duration:</strong>
                  <span>{formData.duration} hour(s)</span>
                </div>
                <div className="confirm-breakdown">
                  <div className="breakd-item">
                    <span>Service Fee:</span>
                    <span>RM {(getSelectedServiceType().basePricePerHour * parseFloat(formData.duration)).toFixed(2)}</span>
                  </div>
                  <div className="breakd-item">
                    <span>Nurse Rate:</span>
                    <span>RM {(getSelectedNurse().hourlyRate * parseFloat(formData.duration)).toFixed(2)}</span>
                  </div>
                  <div className="breakd-item">
                    <span>Fuel Charge:</span>
                    <span>RM {FUEL_COST.toFixed(2)}</span>
                  </div>
                </div>
                <div className="confirm-row-total">
                  <strong>Total Cost:</strong>
                  <strong className="confirm-cost">RM {formData.estimatedCost}</strong>
                </div>
              </div>
              <div className="confirmation-actions">
                <button
                  className="booking-modal-cancel"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="booking-modal-confirm"
                  onClick={handleConfirmBooking}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="spinner" size={16} />
                      <span style={{ marginLeft: '6px' }}>Processing...</span>
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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