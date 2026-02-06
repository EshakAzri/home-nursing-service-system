import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import CustomerBookingPage from './customer/CustomerBookingPage';
import CustomerBookingHistory from './customer/CustomerBookingHistory';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/customer/booking" element={<CustomerBookingPage />} />
          <Route path="/customer/bookings" element={<CustomerBookingHistory />} />
          <Route path="/nurse-dashboard" element={<div><h1>Nurse Dashboard</h1><p>Coming soon...</p></div>} />
          <Route path="/admin-dashboard" element={<div><h1>Admin Dashboard</h1><p>Coming soon...</p></div>} />
          <Route path="/" element={<div><h1>Welcome to Home Nursing Service</h1><a href="/login">Login</a> | <a href="/register">Register</a></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
