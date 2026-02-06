import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, UserPlus, Edit, Trash2, Eye, Shield, Mail
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import './AdminUsers.css';

const AdminUsers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    
    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:8080/api/users', config);
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toString().includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`http://localhost:8080/api/users/${userId}`, config);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'PATIENT': return 'role-badge patient';
      case 'NURSE': return 'role-badge nurse';
      case 'ADMIN': return 'role-badge admin';
      default: return 'role-badge';
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={`admin-dashboard-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="admin-page-header">
          <div>
            <h1>Manage Users</h1>
            <p>View and manage all registered users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by ID, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <Shield size={20} />
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Roles</option>
              <option value="PATIENT">Patient</option>
              <option value="NURSE">Nurse</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="results-count">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users Grid */}
        <div className="users-grid-view">
          {filteredUsers.length === 0 ? (
            <div className="no-data-message">
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-card-header">
                  <div className="user-avatar-large">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role}
                  </span>
                </div>
                
                <div className="user-card-body">
                  <h3>{user.username}</h3>
                  <div className="user-details">
                    <div className="user-detail-item">
                      <Mail size={16} />
                      <span>{user.email}</span>
                    </div>
                    <div className="user-detail-item">
                      <Shield size={16} />
                      <span>User ID: #{user.id}</span>
                    </div>
                  </div>
                </div>

                <div className="user-card-footer">
                  <button 
                    className="action-btn view"
                    onClick={() => handleViewDetails(user)}
                    title="View Details"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteUser(user.id)}
                    title="Delete"
                    disabled={user.role === 'ADMIN'}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Cards */}
        <div className="users-summary">
          <div className="summary-card patient">
            <div className="summary-icon">
              <Shield size={24} />
            </div>
            <div className="summary-content">
              <h4>Patients</h4>
              <p className="summary-count">{users.filter(u => u.role === 'PATIENT').length}</p>
            </div>
          </div>
          <div className="summary-card nurse">
            <div className="summary-icon">
              <Shield size={24} />
            </div>
            <div className="summary-content">
              <h4>Nurses</h4>
              <p className="summary-count">{users.filter(u => u.role === 'NURSE').length}</p>
            </div>
          </div>
          <div className="summary-card admin">
            <div className="summary-icon">
              <Shield size={24} />
            </div>
            <div className="summary-content">
              <h4>Admins</h4>
              <p className="summary-count">{users.filter(u => u.role === 'ADMIN').length}</p>
            </div>
          </div>
        </div>
      </main>

      {/* View Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">#{selectedUser.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Username:</span>
                <span className="detail-value">{selectedUser.username}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Role:</span>
                <span className={getRoleBadgeClass(selectedUser.role)}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Account Status:</span>
                <span className="status-badge confirmed">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
