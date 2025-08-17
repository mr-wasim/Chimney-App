import React, { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function ServiceForms(){
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
    const { data } = await api.get('/admin/service-forms', { params:{ page:p, q, today: today?1:undefined, from, to, technicianId } })
    setItems(data.items); setTotal(data.total); setPage(p)
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Service Forms</h1>
      <Filters {...{q,setQ,today,setToday,from,setFrom,to,setTo, technicianId,setTechnicianId, techs, onSearch:()=>load(1)}} />
      <List items={items} />
      <Pager {...{page,total,onPrev:()=>load(page-1),onNext:()=>load(page+1)}} />
    </div>
  )
}

function Filters({q,setQ,today,setToday,from,setFrom,to,setTo, technicianId,setTechnicianId, techs, onSearch}){
  return (
    <div className="card grid md:grid-cols-6 gap-2">
      <input className="input md:col-span-2" placeholder="Search name/phone/address" value={q} onChange={e=>setQ(e.target.value)} />
      <label className="flex items-center gap-2"><input type="checkbox" checked={today} onChange={e=>setToday(e.target.checked)} /><span>Today</span></label>
      <input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
      <input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} />
      <select className="input" value={technicianId} onChange={e=>setTechnicianId(e.target.value)}>
        <option value="">All Technicians</option>
        {techs.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
      </select>
      <button className="btn btn-primary md:col-span-6" onClick={onSearch}>Search</button>
    </div>
  )
}

function List({ items }){
  return (
    <div className="card">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-slate-300">
          <th>Technician</th><th>Client</th><th>Payment</th><th>Status</th><th>Date</th><th>Signature</th>
        </tr></thead>
        <tbody>
          {items.map(it => (
            <tr key={it._id} className="border-t border-slate-700">
              <td>{it.technician?.name}</td>
              <td>{it.clientName} • {it.phone} • {it.clientAddress}</td>
              <td>₹{it.payment}</td>
              <td>{it.status}</td>
              <td>{new Date(it.submittedAt).toLocaleString()}</td>
              <td>{it.clientSignature ? <img className="h-10" src={it.clientSignature} /> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
function Pager({page,total,onPrev,onNext}){
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-slate-400">Total: {total}</div>
      <div className="flex gap-2">
        <button className="btn btn-outline" disabled={page<=1} onClick={onPrev}>Prev</button>
        <button className="btn btn-outline" disabled={(page*10)>=total} onClick={onNext}>Next</button>
      </div>
    </div>
  )
}
