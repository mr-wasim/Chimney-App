import React, { useEffect, useState, useRef } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import SignaturePad from 'react-signature-canvas'
import io from 'socket.io-client'
import Toast from '../../components/Toast'
import { UserIcon, CreditCardIcon, PhoneIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline"

const socket = io(import.meta.env.VITE_API_BASE || 'http://localhost:4000', { withCredentials:true })

export default function TechLayout(){
  return (
    <Routes>
      <Route index element={<TechHome />} />
      <Route path="register" element={<Register />} />
    </Routes>
  )
}

function Register(){
  const [form, setForm] = useState({ name:'', username:'', password:'', phone:'' })
  const [toast, setToast] = useState({ show:false, message:'' })
  const nav = useNavigate()
  async function submit(e){
    e.preventDefault()
    try {
      await api.post('/auth/register', form)
      setToast({ show:true, message:'Registered! Please login.' })
      setTimeout(()=>nav('/login'), 800)
    } catch (e) {
      setToast({ show:true, message:e.response?.data?.message || 'Failed' })
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Toast show={toast.show} message={toast.message} onClose={()=>setToast({show:false,message:''})} />
      <div className="card mb-[60px] w-full max-w-md">
        <h2 className="text-xl font-semibold mb-3">Create New Technician ID</h2>
        <form onSubmit={submit} className="space-y-2">
          {['name','username','password','phone'].map(k => (
            <div key={k}>
              <label className="label capitalize">{k}</label>
              <input className="input" type={k==='password'?'password':'text'} value={form[k]}
                onChange={e=>setForm({...form,[k]:e.target.value})} />
            </div>
          ))}
          <button className="btn btn-primary w-full">Register</button>
        </form>
        <Link className="text-cyan-400 underline text-sm" to="/login">Back to Login</Link>
      </div>
    </div>
  )
}

function TechHome(){
  const [me, setMe] = useState(null)
  const [tab, setTab] = useState(localStorage.getItem("activeTab") || 'clientForm') // refresh safe
  const [subTab, setSubTab] = useState('all')
  const [calls, setCalls] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(4)
  const [toast, setToast] = useState({ show:false, message:'' })

  // Service form
  const [sf, setSf] = useState({ clientName:'', clientAddress:'', payment:0, phone:'', status:'Under Process', clientSignature:'' })
  const sigRef = useRef()

  // Payment form
  const [pay, setPay] = useState({ payeeName:'', mode:'Online', onlineAmount:0, cashAmount:0, recipientSignature:'', note:'' })
  const paySigRef = useRef()

  // Save tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeTab", tab)
  }, [tab])

  useEffect(() => {
    api.get('/auth/me').then(({data}) => {
      setMe(data);
      socket.emit('join', data.id)
    }).catch(()=>{})
  }, [])

  useEffect(() => {
    if(tab==='callForward'){
      loadCalls(1, subTab)
    }
  }, [subTab, tab])

  useEffect(() => {
    socket.on('new-call', (payload) => {
      setToast({ show:true, message:`New call received: ${payload.clientName}` })
      if(tab==='callForward') loadCalls(1, subTab)
    })
    return () => {
      socket.off('new-call')
    }
  }, [subTab, tab])

  async function loadCalls(p=1, t=subTab){
    const { data } = await api.get('/tech/forwarded-calls', { params:{ page:p, limit, tab:t } })
    setCalls(data.items)
    setTotal(data.total)
    setPage(p)
  }

  async function updateCallStatus(id, status){
    await api.patch(`/tech/forwarded-calls/${id}/status`, { status })
    setToast({ show:true, message:'Status updated' })
    loadCalls(page, subTab)
  }

  function getMapUrl(address){
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
  }

  async function submitServiceForm(e){
    e.preventDefault()
    const clientSignature = sigRef.current?.getTrimmedCanvas().toDataURL('image/png')
    try {
      await api.post('/tech/service-form', { ...sf, clientSignature })
      setToast({ show:true, message:'Service form saved' })
      setSf({ clientName:'', clientAddress:'', payment:0, phone:'', status:'Under Process', clientSignature:'' })
      sigRef.current?.clear()
    } catch (e) {
      setToast({ show:true, message:e.response?.data?.message || 'Error saving form' })
    }
  }

  async function submitPayment(e){
    e.preventDefault()
    const recipientSignature = paySigRef.current?.getTrimmedCanvas().toDataURL('image/png')
    try {
      await api.post('/tech/payments', { ...pay, recipientSignature })
      setToast({ show:true, message:'Payment recorded' })
      setPay({ payeeName:'', mode:'Online', onlineAmount:0, cashAmount:0, recipientSignature:'', note:'' })
      paySigRef.current?.clear()
    } catch (e) {
      setToast({ show:true, message:e.response?.data?.message || 'Payment failed' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toast show={toast.show} message={toast.message} onClose={()=>setToast({show:false,message:''})} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {tab==='clientForm' && (
          <div className="card mb-[60px]">
            <h2 className="text-xl font-semibold mb-2">Service Form</h2>
            <form onSubmit={submitServiceForm} className="space-y-2">
              <div><label className="label">Client Name</label><input className="input" value={sf.clientName} onChange={e=>setSf({...sf, clientName:e.target.value})} /></div>
              <div><label className="label">Client Address</label><input className="input" value={sf.clientAddress} onChange={e=>setSf({...sf, clientAddress:e.target.value})} /></div>
              <div><label className="label">Payment (₹)</label><input type="number" className="input" value={sf.payment} onChange={e=>setSf({...sf, payment:+e.target.value})} /></div>
              <div><label className="label">Phone</label><input className="input" value={sf.phone} onChange={e=>setSf({...sf, phone:e.target.value})} /></div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={sf.status} onChange={e=>setSf({...sf, status:e.target.value})}>
                  {['Services Done','Installation Done','Complaint Done','Under Process'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Client Signature</label>
                <SignaturePad ref={sigRef} penColor="white" canvasProps={{className:'w-full h-28 bg-slate-700 rounded-xl'}} />
              </div>
              <button className="btn btn-primary w-full">Submit</button>
            </form>
          </div>
        )}

        {tab==='callForward' && (
          <div className="card  mb-[60px]">
            <h2 className="text-xl font-semibold mb-2">Forwarded Calls</h2>
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {['all','today','pending','completed','closed'].map(t => (
                <button key={t} onClick={()=>setSubTab(t)} className={`px-3 py-1 rounded-lg ${subTab===t?'bg-blue-600 text-white':'bg-slate-700 text-slate-200'}`}>
                  {t==='all' && 'All'}
                  {t==='today' && 'Today'}
                  {t==='pending' && 'Pending'}
                  {t==='completed' && 'Completed'}
                  {t==='closed' && 'Closed'}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {calls.map(c => (
                <div key={c._id} className="p-3 rounded-xl bg-slate-900 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{c.clientName} <span className="text-xs text-slate-400">({c.status})</span></div>
                    <div className="text-sm text-slate-300">{c.clientPhone} • {c.address}</div>
                  </div>
                  <div className="flex gap-2">
                    <a className="btn btn-outline" href={getMapUrl(c.address)} target="_blank" rel="noreferrer">Go</a>
                    <a className="btn btn-primary" href={`tel:${c.clientPhone}`}>Call</a>
                    <select className="input" value={c.status} onChange={(e)=>updateCallStatus(c._id, e.target.value)}>
                      {['Pending','In Process','Completed','Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-slate-400">Total: {total}</div>
              <div className="flex gap-2">
                <button disabled={page<=1} className="btn btn-outline" onClick={()=>loadCalls(page-1)}>Prev</button>
                <button disabled={(page*limit)>=total} className="btn btn-outline" onClick={()=>loadCalls(page+1)}>Next</button>
              </div>
            </div>
          </div>
        )}

        {tab==='payment' && (
          <div className="card mb-[60px]">
            <h2 className="text-xl font-semibold mb-2">Payment Form</h2>
            <form onSubmit={submitPayment} className="space-y-2">
              <div><label className="label">Payee Name</label><input className="input" value={pay.payeeName} onChange={e=>setPay({...pay, payeeName:e.target.value})} /></div>
              <div>
                <label className="label">Payment Mode</label>
                <select className="input" value={pay.mode} onChange={e=>setPay({...pay, mode:e.target.value})}>
                  <option>Online</option>
                  <option>Cash</option>
                  <option>Mixed</option>
                </select>
              </div>
              {(pay.mode==='Online' || pay.mode==='Mixed') && (
                <div><label className="label">Online Amount (₹)</label><input type="number" className="input" value={pay.onlineAmount} onChange={e=>setPay({...pay, onlineAmount:+e.target.value})} /></div>
              )}
              {(pay.mode==='Cash' || pay.mode==='Mixed') && (
                <div><label className="label">Cash Amount (₹)</label><input type="number" className="input" value={pay.cashAmount} onChange={e=>setPay({...pay, cashAmount:+e.target.value})} /></div>
              )}
              <div><label className="label">Recipient Signature</label><SignaturePad ref={paySigRef} penColor="white" canvasProps={{className:'w-full h-28 bg-slate-700 rounded-xl'}} /></div>
              <div><label className="label">Note</label><input className="input" value={pay.note} onChange={e=>setPay({...pay, note:e.target.value})} /></div>
              <button className="btn btn-primary w-full">Submit</button>
            </form>
          </div>
        )}

        {tab==='profile' && me && (
          <div className="card mb-[60px] text-center p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <UserIcon className="w-10 h-10"/>
              </div>
              <h2 className="text-2xl font-bold">{me.name}</h2>
              <p className="text-sm opacity-90">{me.phone}</p>
              <button className="btn bg-red-500 hover:bg-red-600 w-full mt-3" onClick={()=>{ api.post('/auth/logout').then(()=>window.location='/login') }}>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-700 flex justify-around py-2">
        <button onClick={()=>setTab('clientForm')} className={`flex flex-col items-center ${tab==='clientForm'?'text-blue-500':'text-slate-400'}`}>
          <ClipboardDocumentIcon className="w-6 h-6"/> <span className="text-xs">Form</span>
        </button>
        <button onClick={()=>setTab('callForward')} className={`flex flex-col items-center ${tab==='callForward'?'text-blue-500':'text-slate-400'}`}>
          <PhoneIcon className="w-6 h-6"/> <span className="text-xs">Calls</span>
        </button>
        <button onClick={()=>setTab('payment')} className={`flex flex-col items-center ${tab==='payment'?'text-blue-500':'text-slate-400'}`}>
          <CreditCardIcon className="w-6 h-6"/> <span className="text-xs">Payment</span>
        </button>
        <button onClick={()=>setTab('profile')} className={`flex flex-col items-center ${tab==='profile'?'text-blue-500':'text-slate-400'}`}>
          <UserIcon className="w-6 h-6"/> <span className="text-xs">Profile</span>
        </button>
      </nav>
    </div>
  )
}
