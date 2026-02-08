import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, UserPlus, Edit, Trash2, Eye, 
  CheckCircle, XCircle, Phone, Mail, Award,
  Heart, Stethoscope, Activity, Baby, Shield,
  CheckSquare
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import './AdminNurses.css';

const AdminNurses = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [nurses, setNurses] = useState([]);
  const [filteredNurses, setFilteredNurses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [nurseServiceConfigurations, setNurseServiceConfigurations] = useState([]);
  const [selectedServiceTypeIds, setSelectedServiceTypeIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    specialization: '',
    yearsOfExperience: '',
    bio: '',
    hourlyRate: '',
    isAvailable: true,
    dateOfBirth: '',
    branchId: ''
  });
  const navigate = useNavigate();

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 4000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [navigate]);

  useEffect(() => {
    filterNurses();
  }, [searchTerm, nurses]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [nursesRes, branchesRes, serviceTypesRes] = await Promise.all([
        axios.get('http://localhost:8080/api/nurses', config),
        axios.get('http://localhost:8080/api/branches', config),
        axios.get('http://localhost:8080/api/service-types', config)
      ]);

      setNurses(nursesRes.data);
      setFilteredNurses(nursesRes.data);
      setBranches(branchesRes.data);
      setServiceTypes(serviceTypesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const filterNurses = () => {
    if (!searchTerm) {
      setFilteredNurses(nurses);
      return;
    }

    const filtered = nurses.filter(nurse =>
      `${nurse.firstName} ${nurse.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nurse.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nurse.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nurse.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredNurses(filtered);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleViewDetails = (nurse) => {
    setSelectedNurse(nurse);
    setShowModal(true);
  };

  const handleEditNurse = async (nurse) => {
    setSelectedNurse(nurse);
    setFormData({
      firstName: nurse.firstName,
      lastName: nurse.lastName,
      email: nurse.email,
      phoneNumber: nurse.phoneNumber,
      licenseNumber: nurse.licenseNumber,
      licenseExpiryDate: nurse.licenseExpiryDate,
      specialization: nurse.specialization,
      yearsOfExperience: nurse.yearsOfExperience,
      bio: nurse.bio || '',
      hourlyRate: nurse.hourlyRate,
      isAvailable: nurse.isAvailable,
      dateOfBirth: nurse.dateOfBirth,
      branchId: nurse.branch?.id || ''
    });

    // Fetch service configurations for this nurse
    try {
      const token = localStorage.getItem('token');
      //console.log('Token from localStorage:', token);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      //console.log('Making request to:', `http://localhost:8080/api/service-configurations/nurse/${nurse.id}`);
      const response = await axios.get(`http://localhost:8080/api/service-configurations/nurse/${nurse.id}`, config);
      //console.log('Service configurations response:', response.data);
      setNurseServiceConfigurations(response.data);
      const activeServiceTypeIds = response.data.filter(sc => sc.isActive).map(sc => sc.serviceType.id);
      //console.log('Active service type IDs:', activeServiceTypeIds);
      setSelectedServiceTypeIds(activeServiceTypeIds);
    } catch (error) {
      console.error('Error fetching service configurations:', error);
      console.error('Error response:', error.response);
      setNurseServiceConfigurations([]);
      setSelectedServiceTypeIds([]);
    }

    setShowEditModal(true);
  };

  const handleAddNurse = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      licenseNumber: '',
      licenseExpiryDate: '',
      specialization: '',
      yearsOfExperience: '',
      bio: '',
      hourlyRate: '',
      isAvailable: true,
      dateOfBirth: '',
      branchId: ''
    });
    setSelectedServiceTypeIds([]);
    setShowAddModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleServiceTypeChange = (serviceTypeId, checked) => {
    if (checked) {
      setSelectedServiceTypeIds(prev => [...prev, serviceTypeId]);
    } else {
      setSelectedServiceTypeIds(prev => prev.filter(id => id !== serviceTypeId));
    }
  };

  const updateServiceConfigurations = async (nurseId, selectedIds) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Get current active configurations
    const currentActive = nurseServiceConfigurations.filter(sc => sc.isActive).map(sc => sc.serviceType.id);

    // Find to deactivate
    const toDeactivate = currentActive.filter(id => !selectedIds.includes(id));
    // Find to activate/add
    const toActivate = selectedIds.filter(id => !currentActive.includes(id));

    // Deactivate
    for (const serviceTypeId of toDeactivate) {
      const sc = nurseServiceConfigurations.find(sc => sc.serviceType.id === serviceTypeId);
      if (sc) {
        const payload = {
          id: sc.id,
          nurse: { id: nurseId },
          serviceType: { id: sc.serviceType.id },
          isActive: false
        };
        await axios.put(`http://localhost:8080/api/service-configurations/${sc.id}`, payload, config);
      }
    }

    // Activate or add
    for (const serviceTypeId of toActivate) {
      const existing = nurseServiceConfigurations.find(sc => sc.serviceType.id === serviceTypeId);
      if (existing) {
        const payload = {
          id: existing.id,
          nurse: { id: nurseId },
          serviceType: { id: existing.serviceType.id },
          isActive: true
        };
        await axios.put(`http://localhost:8080/api/service-configurations/${existing.id}`, payload, config);
      } else {
        const payload = {
          nurse: { id: nurseId },
          serviceType: { id: serviceTypeId },
          isActive: true
        };
        await axios.post('http://localhost:8080/api/service-configurations', payload, config);
      }
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const payload = {
        ...formData,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        hourlyRate: parseFloat(formData.hourlyRate),
        branch: { id: parseInt(formData.branchId) }
      };

      const response = await axios.post('http://localhost:8080/api/nurses', payload, config);
      const newNurseId = response.data.id;
      await fetchData();

      // Add service configurations for new nurse
      if (selectedServiceTypeIds.length > 0) {
        await updateServiceConfigurations(newNurseId, selectedServiceTypeIds);
      }

      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding nurse:', error);
      showNotification('Failed to add nurse: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showNotification('No authentication token found. Please log in again.', 'error');
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const payload = {
        ...formData,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        hourlyRate: parseFloat(formData.hourlyRate),
        branch: { id: parseInt(formData.branchId) }
      };

      await axios.put(`http://localhost:8080/api/nurses/${selectedNurse.id}`, payload, config);
      
      await fetchData();

      // Update service configurations
      await updateServiceConfigurations(selectedNurse.id, selectedServiceTypeIds);

      setShowEditModal(false);
      setSelectedNurse(null);
      showNotification('Nurse updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating nurse:', error);
      if (error.response?.status === 403) {
        showNotification('Authentication failed. Please log in again.', 'error');
        navigate('/login');
      } else if (error.response?.status === 401) {
        showNotification('Your session has expired. Please log in again.', 'error');
        navigate('/login');
      } else {
        showNotification('Failed to update nurse: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const handleDeleteNurse = async (nurseId) => {
    if (!window.confirm('Are you sure you want to delete this nurse?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`http://localhost:8080/api/nurses/${nurseId}`, config);
      await fetchData();
      showNotification('Nurse deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting nurse:', error);
      showNotification('Failed to delete nurse: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const getServiceTypeIcon = (serviceTypeName) => {
    const name = serviceTypeName.toLowerCase();
    if (name.includes('cardiac') || name.includes('heart')) return Heart;
    if (name.includes('pediatric') || name.includes('child')) return Baby;
    if (name.includes('emergency') || name.includes('critical')) return Shield;
    if (name.includes('general') || name.includes('checkup')) return Stethoscope;
    return Activity; // default icon
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading nurses...</p>
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
            <h1>Manage Nurses</h1>
            <p>View and manage all registered nurses</p>
          </div>
          <button className="add-nurse-btn" onClick={handleAddNurse}>
            <UserPlus size={20} />
            Add Nurse
          </button>
        </div>

        {/* Search */}
        <div className="admin-filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, email, specialization, or license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="results-count">
            Showing {filteredNurses.length} of {nurses.length} nurses
          </div>
        </div>

        {/* Nurses Grid */}
        <div className="nurses-grid">
          {filteredNurses.length === 0 ? (
            <div className="no-data-message">
              <p>No nurses found</p>
            </div>
          ) : (
            filteredNurses.map(nurse => (
              <div key={nurse.id} className="nurse-card">
                <div className="nurse-card-header">
                  <div className="nurse-avatar">
                    {nurse.firstName.charAt(0)}{nurse.lastName.charAt(0)}
                  </div>
                  <div className={`availability-badge ${nurse.isAvailable ? 'available' : 'unavailable'}`}>
                    {nurse.isAvailable ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {nurse.isAvailable ? 'Available' : 'Unavailable'}
                  </div>
                </div>
                
                <div className="nurse-card-body">
                  <h3>{nurse.firstName} {nurse.lastName}</h3>
                  <p className="specialization">
                    <Award size={16} />
                    {nurse.specialization}
                  </p>
                  
                  <div className="nurse-info">
                    <div className="info-item">
                      <Mail size={14} />
                      <span>{nurse.email}</span>
                    </div>
                    <div className="info-item">
                      <Phone size={14} />
                      <span>{nurse.phoneNumber}</span>
                    </div>
                  </div>

                  <div className="nurse-stats">
                    <div className="stat">
                      <span className="stat-label">Experience</span>
                      <span className="stat-value">{nurse.yearsOfExperience} years</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Hourly Rate</span>
                      <span className="stat-value">{formatCurrency(nurse.hourlyRate)}</span>
                    </div>
                  </div>

                  <div className="nurse-branch">
                    <span>Branch: {nurse.branch?.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="nurse-card-footer">
                  <button 
                    className="action-btn view"
                    onClick={() => handleViewDetails(nurse)}
                    title="View Details"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEditNurse(nurse)}
                    title="Edit"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteNurse(nurse.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* View Details Modal */}
      {showModal && selectedNurse && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nurse Details</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Nurse ID:</span>
                <span className="detail-value">#{selectedNurse.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">{selectedNurse.firstName} {selectedNurse.lastName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedNurse.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedNurse.phoneNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">License Number:</span>
                <span className="detail-value">{selectedNurse.licenseNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">License Expiry:</span>
                <span className="detail-value">{formatDate(selectedNurse.licenseExpiryDate)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date of Birth:</span>
                <span className="detail-value">{formatDate(selectedNurse.dateOfBirth)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Specialization:</span>
                <span className="detail-value">{selectedNurse.specialization}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Experience:</span>
                <span className="detail-value">{selectedNurse.yearsOfExperience} years</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Hourly Rate:</span>
                <span className="detail-value">{formatCurrency(selectedNurse.hourlyRate)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Branch:</span>
                <span className="detail-value">{selectedNurse.branch?.name || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Availability:</span>
                <span className={`availability-badge ${selectedNurse.isAvailable ? 'available' : 'unavailable'}`}>
                  {selectedNurse.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              {selectedNurse.bio && (
                <div className="detail-row">
                  <span className="detail-label">Bio:</span>
                  <span className="detail-value">{selectedNurse.bio}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {(showAddModal || showEditModal) && (
          <div className="modal-overlay" onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedServiceTypeIds([]); }}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showAddModal ? 'Add New Nurse' : 'Edit Nurse'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedServiceTypeIds([]); }} className="close-btn">×</button>
            </div>
            <form onSubmit={showAddModal ? handleSubmitAdd : handleSubmitEdit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>License Number *</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>License Expiry Date *</label>
                    <input
                      type="date"
                      name="licenseExpiryDate"
                      value={formData.licenseExpiryDate}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Specialization *</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Years of Experience *</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleFormChange}
                      required
                      min="0"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Hourly Rate ($) *</label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Branch *</label>
                    <select
                      name="branchId"
                      value={formData.branchId}
                      onChange={handleFormChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select Branch</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <div className="service-config-header">
                      <CheckSquare size={20} />
                      <label>Service Configurations</label>
                      <span className="config-subtitle">Select the services this nurse can provide</span>
                    </div>
                    <div className="service-types-grid">
                      {serviceTypes.map(serviceType => {
                        const IconComponent = getServiceTypeIcon(serviceType.name);
                        const isSelected = selectedServiceTypeIds.includes(serviceType.id);
                        return (
                          <label key={serviceType.id} className={`service-type-card ${isSelected ? 'selected' : ''}`}>
                            <div className="service-card-header">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleServiceTypeChange(serviceType.id, e.target.checked)}
                              />
                              <IconComponent size={24} className="service-icon" />
                            </div>
                            <div className="service-card-content">
                              <span className="service-name">{serviceType.name}</span>
                              <small className="service-description">{serviceType.description}</small>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleFormChange}
                      />
                      <span>Available for bookings</span>
                    </label>
                  </div>
                  <div className="form-group full-width">
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleFormChange}
                      rows="3"
                      className="form-textarea"
                      placeholder="Optional bio or notes..."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedServiceTypeIds([]); }} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {showAddModal ? 'Add Nurse' : 'Update Nurse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' && <CheckCircle size={20} />}
            {notification.type === 'error' && <XCircle size={20} />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNurses;
