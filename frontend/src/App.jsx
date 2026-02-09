import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import CustomerDashboard from './customer/CustomerDashboard';
import CustomerBookingPage from './customer/CustomerBookingPage';
import CustomerBookingHistory from './customer/CustomerBookingHistory';
import CustomerProfile from './customer/CustomerProfile';
import CustomerInvoice from './customer/CustomerInvoice';
import NurseDashboard from './nurse/NurseDashboard';
import NurseAssignments from './nurse/NurseAssignments';
import NurseProfile from './nurse/NurseProfile';
import AdminDashboard from './admin/AdminDashboard';
import AdminBookings from './admin/AdminBookings';
import AdminNurses from './admin/AdminNurses';
import AdminUsers from './admin/AdminUsers';
import AdminReports from './admin/AdminReports';
import AdminEarnings from './admin/AdminEarnings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/booking" element={<CustomerBookingPage />} />
          <Route path="/customer/bookings" element={<CustomerBookingHistory />} />
          <Route path="/customer/invoice/:bookingId" element={<CustomerInvoice />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/nurse/dashboard" element={<NurseDashboard />} />
          <Route path="/nurse/assignments" element={<NurseAssignments />} />
          <Route path="/nurse/schedule" element={<div style={{padding: '2rem'}}><h1>Nurse Schedule</h1><p>Coming soon...</p></div>} />
          <Route path="/nurse/profile" element={<NurseProfile />} />
          <Route path="/nurse-dashboard" element={<NurseDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/nurses" element={<AdminNurses />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/earnings" element={<AdminEarnings />} />
          <Route path="/" element={<div><h1>Welcome to Home Nursing Service</h1><a href="/login">Login</a> | <a href="/register">Register</a></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
