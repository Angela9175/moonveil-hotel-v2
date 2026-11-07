import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HotelInfoPage from './pages/HotelInfoPage';
import AdminDashboard from './pages/AdminDashboard';
import AvailabilityCalendarPage from './pages/AvailabilityCalendarPage';

import './App.css';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />

          {/* Availability Route Protected for Admin & Staff only */}
          <Route path="/availability" element={
            <ProtectedRoute roles={['admin', 'staff']}><AvailabilityCalendarPage /></ProtectedRoute>
          } />

          <Route path="/hotel" element={<HotelInfoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/book/:roomId" element={
            <ProtectedRoute><BookingPage /></ProtectedRoute>
          } />
          
          <Route path="/my-bookings" element={
            <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute><CustomerProfilePage /></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard role="admin" /></ProtectedRoute>
          } />
          
          <Route path="/staff" element={
            <ProtectedRoute roles={['staff']}><AdminDashboard role="staff" /></ProtectedRoute>
          } />
          
          <Route path="*" element={
            <div className="section"><h1>404 – Page Not Found</h1></div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}