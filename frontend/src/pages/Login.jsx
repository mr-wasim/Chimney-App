import React, { useState } from 'react'
import api from '../lib/api'
import Toast from '../components/Toast'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [toast, setToast] = useState({ show: false, message: '' })
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    try {
      const { data } = await api.post(
        '/auth/login',
        { username, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      setToast({ show: true, message: 'Login successful' })
      if (data.user.role === 'admin') nav('/admin')
      else nav('/tech')
    } catch (e) {
      setToast({
        show: true,
        message: e.response?.data?.message || 'Login failed',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Chimney CRM</h1>
        <p className="text-slate-300 mb-4">Admin & Technician Login</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <button className="btn btn-primary w-full">Login</button>
        </form>
        <div className="mt-4 text-sm text-slate-300">
          New technician?{' '}
          <a className="text-cyan-400 underline" href="/tech/register">
            Create New Technician ID
          </a>
        </div>
      </div>
    </div>
  )
}
