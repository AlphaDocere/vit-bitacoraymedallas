import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

// Layouts
import DashboardLayout from './layout/DashboardLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Bitacora from './pages/Bitacora';
import Historial from './pages/Historial';
import AdminPanel from './pages/AdminPanel';
import Insignias from './pages/Insignias';
import Companeros from './pages/Companeros';
import DashboardHome from './pages/DashboardHome';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <div className="bg-animated"></div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (Dashboard) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="bitacora" element={<Bitacora />} />
          <Route path="historial" element={<Historial />} />
          <Route path="insignias" element={<Insignias />} />
          <Route path="companeros" element={<Companeros />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
