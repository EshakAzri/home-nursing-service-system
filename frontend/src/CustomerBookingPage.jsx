import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerBookingPage = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    nurseId: '',
    bookingDateTime: '',
    serviceStartTime: '',
    serviceEndTime: '',
    serviceType: '',
    estimatedCost: '',
    notes: ''
  });
  const [nurses, setNurses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      try {
        const [nursesRes, patientsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/nurses', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8080/api/patients', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setNurses(nursesRes.data);
        setPatients(patientsRes.data);
      } catch (error) {
        console.log('Error fetching data:', error.response || error);
        setMessage('Failed to load data. Please login again.');
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
    };
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/bookings', {
        patient: { id: formData.patientId },
        nurse: { id: formData.nurseId },
        bookingDateTime: formData.bookingDateTime,
        serviceStartTime: formData.serviceStartTime,
        serviceEndTime: formData.serviceEndTime,
        serviceType: formData.serviceType,
        estimatedCost: parseFloat(formData.estimatedCost),
        notes: formData.notes
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Booking created successfully!');
      setFormData({
        patientId: '', nurseId: '', bookingDateTime: '', serviceStartTime: '',
        serviceEndTime: '', serviceType: '', estimatedCost: '', notes: ''
      });
    } catch (error) {
      setMessage('Error creating booking.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Customer Booking Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Patient:</label>
          <select name="patientId" value={formData.patientId} onChange={handleChange} required>
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Nurse:</label>
          <select name="nurseId" value={formData.nurseId} onChange={handleChange} required>
            <option value="">Select Nurse</option>
            {nurses.filter(nurse => nurse.isAvailable).map(nurse => (
              <option key={nurse.id} value={nurse.id}>
                {nurse.firstName} {nurse.lastName} - {nurse.specialization}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Booking Date & Time:</label>
          <input type="datetime-local" name="bookingDateTime" value={formData.bookingDateTime} onChange={handleChange} required />
        </div>
        <div>
          <label>Service Start Time:</label>
          <input type="datetime-local" name="serviceStartTime" value={formData.serviceStartTime} onChange={handleChange} required />
        </div>
        <div>
          <label>Service End Time:</label>
          <input type="datetime-local" name="serviceEndTime" value={formData.serviceEndTime} onChange={handleChange} required />
        </div>
        <div>
          <label>Service Type:</label>
          <input type="text" name="serviceType" value={formData.serviceType} onChange={handleChange} required />
        </div>
        <div>
          <label>Estimated Cost:</label>
          <input type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} required />
        </div>
        <div>
          <label>Notes:</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} />
        </div>
        <button type="submit">Book Now</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>Logout</button>
    </div>
  );
};

export default CustomerBookingPage;