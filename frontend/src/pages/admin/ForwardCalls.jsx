import React, { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function ForwardCalls(){
  const [form, setForm] = useState({ clientName:'', clientPhone:'', address:'', technicianId:'' })
  const [techs, setTechs] = useState([])
  const [recent, setRecent] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(()=>{ api.get('/admin/technicians').then(({data})=>{ setTechs(data.items); if (data.items[0]) setForm(f=>({...f, technicianId:data.items[0]._id})) }) },[])
  useEffect(()=>{ loadRecent() },[])

  async function forwardCall(e){
    e.preventDefault()
    await api.post('/admin/forward-call', form)
    setForm({...form, clientName:'', clientPhone:'', address:''})
    loadRecent()
  }

  async function loadRecent(){
    const { data } = await api.get('/admin/forwarded-calls', { params:{ limit:10 } })
    setRecent(data.items); setTotal(data.total)
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Call Forwarding</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-2">Forward Call Form</h3>
          <form onSubmit={forwardCall} className="space-y-2">
            <input className="input" placeholder="Client Name" value={form.clientName} onChange={e=>setForm({...form, clientName:e.target.value})} />
            <input className="input" placeholder="Client Phone" value={form.clientPhone} onChange={e=>setForm({...form, clientPhone:e.target.value})} />
            <input className="input" placeholder="Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} />
            <select className="input" value={form.technicianId} onChange={e=>setForm({...form, technicianId:e.target.value})}>
              {techs.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <button className="btn btn-primary w-full">Forward</button>
          </form>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Recent Forwarded Calls</h3>
          <ul className="space-y-2">
            {recent.map(c => (
              <li key={c._id} className="text-sm border-b border-slate-700 pb-1">
                {c.clientName} • {c.clientPhone} • {c.address} — <span className="text-slate-300">{c.assignedTo?.name}</span>
              </li>
            ))}
          </ul>
          <div className="text-sm text-slate-400 mt-2">Total: {total}</div>
        </div>
      </div>
    </div>
  )
}
