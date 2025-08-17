import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Dashboard from './Dashboard.jsx'
import ServiceForms from './ServiceForms.jsx'
import ForwardCalls from './ForwardCalls.jsx'
import Payments from './Payments.jsx'
import Technicians from './Technicians.jsx'

export default function AdminLayout(){
  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr]">
      <aside className="bg-slate-800 p-4">
        <h2 className="text-xl font-bold mb-4">Admin CRM</h2>
        <nav className="flex flex-col gap-2">
          <Link className="btn btn-outline" to="">Dashboard</Link>
          <Link className="btn btn-outline" to="service-forms">Service Forms</Link>
          <Link className="btn btn-outline" to="forward-calls">Call Forwarding</Link>
          <Link className="btn btn-outline" to="payments">Reports / Payments</Link>
          <Link className="btn btn-outline" to="technicians">Technicians</Link>
        </nav>
      </aside>
      <main className="p-4">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="service-forms" element={<ServiceForms />} />
          <Route path="forward-calls" element={<ForwardCalls />} />
          <Route path="payments" element={<Payments />} />
          <Route path="technicians/*" element={<Technicians />} />
          <Route path="*" element={<Navigate to="" />} />
        </Routes>
      </main>
    </div>
  )
}
