import React, { useState, useEffect } from 'react';

const AuthAndBooking = () => {
  const [page, setPage] = useState('home'); // home, login, register, booking
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [formData, setFormData] = useState({
    username: '', password: '', email: '', role: 'PATIENT',
    patientId: '', nurseId: '', bookingDateTime: '', serviceStartTime: '',
    serviceEndTime: '', serviceType: '', estimatedCost: '', notes: ''
  });
  const [nurses, setNurses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const [nursesRes, patientsRes] = await Promise.all([
        fetch('http://localhost:8080/api/nurses', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:8080/api/patients', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setNurses(await nursesRes.json());
      setPatients(await patientsRes.json());
    } catch (error) {
      setMessage('Failed to load data.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password, email: formData.email, role: formData.role })
      });
      if (response.ok) {
        setMessage('Registration successful! Please login.');
        setPage('login');
      } else {
        setMessage('Registration failed.');
      }
    } catch (error) {
      setMessage('Error registering.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setMessage('Login successful!');
        setPage('booking');
      } else {
        setMessage('Invalid credentials.');
      }
    } catch (error) {
      setMessage('Error logging in.');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patient: { id: formData.patientId },
          nurse: { id: formData.nurseId },
          bookingDateTime: formData.bookingDateTime,
          serviceStartTime: formData.serviceStartTime,
          serviceEndTime: formData.serviceEndTime,
          serviceType: formData.serviceType,
          estimatedCost: parseFloat(formData.estimatedCost),
          notes: formData.notes
        })
      });
      if (response.ok) {
        setMessage('Booking created successfully!');
        setFormData({ ...formData, patientId: '', nurseId: '', bookingDateTime: '', serviceStartTime: '', serviceEndTime: '', serviceType: '', estimatedCost: '', notes: '' });
      } else {
        setMessage('Error creating booking.');
      }
    } catch (error) {
      setMessage('Error creating booking.');
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setPage('home');
    setMessage('');
  };

  if (page === 'home') {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Welcome to Home Nursing Service</h1>
        <button onClick={() => setPage('login')}>Login</button>
        <button onClick={() => setPage('register')}>Register</button>
      </div>
    );
  }

  if (page === 'register') {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="PATIENT">Patient</option>
            <option value="NURSE">Nurse</option>
          </select>
          <button type="submit">Register</button>
        </form>
        <button onClick={() => setPage('login')}>Already have account? Login</button>
        {message && <p>{message}</p>}
      </div>
    );
  }

  if (page === 'login') {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <button type="submit">Login</button>
        </form>
        <button onClick={() => setPage('register')}>Need account? Register</button>
        {message && <p>{message}</p>}
      </div>
    );
  }

  if (page === 'booking') {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Customer Booking Page</h1>
        <form onSubmit={handleBooking}>
          <select name="patientId" value={formData.patientId} onChange={handleChange} required>
            <option value="">Select Patient</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
          </select>
          <select name="nurseId" value={formData.nurseId} onChange={handleChange} required>
            <option value="">Select Nurse</option>
            {nurses.filter(n => n.isAvailable).map(n => <option key={n.id} value={n.id}>{n.firstName} {n.lastName}</option>)}
          </select>
          <input type="datetime-local" name="bookingDateTime" value={formData.bookingDateTime} onChange={handleChange} required />
          <input type="datetime-local" name="serviceStartTime" value={formData.serviceStartTime} onChange={handleChange} required />
          <input type="datetime-local" name="serviceEndTime" value={formData.serviceEndTime} onChange={handleChange} required />
          <input type="text" name="serviceType" placeholder="Service Type" value={formData.serviceType} onChange={handleChange} required />
          <input type="number" name="estimatedCost" placeholder="Estimated Cost" value={formData.estimatedCost} onChange={handleChange} required />
          <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} />
          <button type="submit">Book Now</button>
        </form>
        <button onClick={logout}>Logout</button>
        {message && <p>{message}</p>}
      </div>
    );
  }

  return null;
};

export default AuthAndBooking;