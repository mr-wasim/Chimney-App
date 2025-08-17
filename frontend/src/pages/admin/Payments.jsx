import React, { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function Payments(){
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [today, setToday] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [technicianId, setTechnicianId] = useState('')
  const [techs, setTechs] = useState([])

  useEffect(()=>{ api.get('/admin/technicians').then(({data})=> setTechs(data.items)) }, [])

  useEffect(()=>{ load(1) }, [today, technicianId])

  async function load(p=1){
    const { data } = await api.get('/admin/payments', { params:{ page:p, q, today: today?1:undefined, from, to, technicianId } })
    setItems(data.items); setTotal(data.total); setPage(p)
  }

  const totalAmount = items.reduce((s,x)=> s + (x.onlineAmount||0) + (x.cashAmount||0), 0)

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Reports / Payments</h1>
      <div className="card grid md:grid-cols-6 gap-2">
        <input className="input md:col-span-2" placeholder="Search payee" value={q} onChange={e=>setQ(e.target.value)} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={today} onChange={e=>setToday(e.target.checked)} /><span>Today</span></label>
        <input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        <input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} />
        <select className="input" value={technicianId} onChange={e=>setTechnicianId(e.target.value)}>
          <option value="">All Technicians</option>
          {techs.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
        <button className="btn btn-primary md:col-span-6" onClick={()=>load(1)}>Search</button>
      </div>

      <div className="card">
        <div className="text-sm text-slate-300 mb-2">Total on page: ₹{totalAmount}</div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-300">
            <th>Technician</th><th>Payee</th><th>Mode</th><th>Online</th><th>Cash</th><th>Total</th><th>Date</th><th>Signature</th>
          </tr></thead>
          <tbody>
            {items.map(it => (
              <tr key={it._id} className="border-t border-slate-700">
                <td>{it.technician?.name}</td>
                <td>{it.payeeName}</td>
                <td>{it.mode}</td>
                <td>₹{it.onlineAmount||0}</td>
                <td>₹{it.cashAmount||0}</td>
                <td>₹{(it.onlineAmount||0)+(it.cashAmount||0)}</td>
                <td>{new Date(it.createdAt).toLocaleString()}</td>
                <td>{it.recipientSignature ? <img className="h-10" src={it.recipientSignature} /> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">Total: {total}</div>
        <div className="flex gap-2">
          <button className="btn btn-outline" disabled={page<=1} onClick={()=>load(page-1)}>Prev</button>
          <button className="btn btn-outline" disabled={(page*10)>=total} onClick={()=>load(page+1)}>Next</button>
        </div>
      </div>
    </div>
  )
}
