import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import CustomerBookingPage from './CustomerBookingPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<CustomerBookingPage />} />
          <Route path="/" element={<div><h1>Welcome to Home Nursing Service</h1><a href="/login">Login</a> | <a href="/register">Register</a></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
