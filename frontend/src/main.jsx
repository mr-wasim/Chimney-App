import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Login from './pages/Login.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import TechLayout from './pages/tech/TechLayout.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/tech/*" element={<TechLayout />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
