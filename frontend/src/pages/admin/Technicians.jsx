import React, { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Routes, Route, Link, useParams } from 'react-router-dom'

export default function Technicians(){
  return (
    <Routes>
      <Route index element={<TechList />} />
      <Route path=":id" element={<TechDetail />} />
    </Routes>
  )
}

function TechList(){
  const [items, setItems] = useState([])
  useEffect(()=>{ api.get('/admin/technicians').then(({data})=> setItems(data.items)) }, [])
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Technicians</h1>
      <div className="card">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-300"><th>Name</th><th>Username</th><th>Phone</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {items.map(it => (
              <tr key={it._id} className="border-t border-slate-700">
                <td>{it.name}</td><td>{it.username}</td><td>{it.phone||'—'}</td><td>{new Date(it.createdAt).toLocaleDateString()}</td>
                <td><Link className="text-cyan-400 underline" to={it._id}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TechDetail(){
  const { id } = useParams()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [summary, setSummary] = useState(null)

  async function load(){
    const { data } = await api.get(`/admin/technicians/${id}/summary`, { params:{ from, to } })
    setSummary(data)
  }

  useEffect(()=>{ load() }, [])

  const total = summary?.totalCollection || 0

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Technician Details</h1>
      <div className="card grid md:grid-cols-5 gap-2">
        <input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        <input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} />
        <button className="btn btn-primary md:col-span-3" onClick={load}>Load</button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card"><div className="text-slate-300">Total Jobs</div><div className="text-3xl font-bold">{summary?.totalJobs ?? '—'}</div></div>
        <div className="card"><div className="text-slate-300">Total Collection</div><div className="text-3xl font-bold">₹{total}</div></div>
        <div className="card"><div className="text-slate-300">Avg / Job</div><div className="text-3xl font-bold">₹{summary?.totalJobs?Math.round(total/summary.totalJobs):0}</div></div>
      </div>
      <div className="card">
        <div className="font-semibold mb-2">Payments</div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-300"><th>Date</th><th>Mode</th><th>Online</th><th>Cash</th><th>Total</th></tr></thead>
          <tbody>
            {(summary?.payments||[]).map(p => (
              <tr key={p._id} className="border-t border-slate-700">
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>{p.mode}</td>
                <td>₹{p.onlineAmount||0}</td>
                <td>₹{p.cashAmount||0}</td>
                <td>₹{(p.onlineAmount||0)+(p.cashAmount||0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="font-semibold mb-2">Service Forms</div>
        <ul className="space-y-1 text-sm">
          {(summary?.forms||[]).map(f => (
            <li key={f._id} className="border-b border-slate-700 pb-1">{f.clientName} — ₹{f.payment} — {f.status} — {new Date(f.submittedAt).toLocaleString()}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
