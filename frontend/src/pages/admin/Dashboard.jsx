import React, { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([
      api.get('/admin/forwarded-calls', { params: { limit: 5 } }),
      api.get('/admin/service-forms',   { params: { limit: 5 } }),
      api.get('/admin/payments',        { params: { limit: 5 } }),
      api.get('/admin/technicians',     { params: { limit: 1 } }),
    ])
      .then(([fc, sf, pay, techs]) => {
        if (!mounted) return
        const calls = (fc?.data?.items || []).map(normalizeCall)
        const forms = (sf?.data?.items || []).map(normalizeForm)
        const pays  = (pay?.data?.items || []).map(normalizePayment)

        setRecent([
          { title: 'Recent Forwarded Calls', type: 'calls', data: calls },
          { title: 'Recent Service Forms',   type: 'forms', data: forms },
          { title: 'Recent Payments',        type: 'payments', data: pays },
        ])

        const techCount =
          numberOrNull(techs?.data?.total) ??
          (Array.isArray(techs?.data?.items) ? techs.data.items.length : null)

        setStats({ technicians: techCount ?? '—' })
      })
      .finally(() => setLoading(false))

    return () => { mounted = false }
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Summary</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="Technicians" value={stats?.technicians ?? '—'} />
        <div className="card">
          <div className="text-slate-300">Forwarded Calls</div>
          <RecentCount endpoint="/admin/forwarded-calls" />
        </div>
        <div className="card">
          <div className="text-slate-300">Payments Today</div>
          <RecentCount endpoint="/admin/payments" today />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {recent.map((r, i) => (
          <div key={i} className="card">
            <div className="font-semibold mb-2">{r.title}</div>
            <ul className="space-y-2">
              {loading && [...Array(3)].map((_,sk) => (
                <li key={sk} className="animate-pulse h-10 rounded bg-slate-700/40" />
              ))}

              {!loading && (r.data || []).map((x) => (
                <li key={x.id} className="text-sm text-slate-300 border-b border-slate-700 pb-1">
                  {r.type === 'calls' && <CallRow x={x} />}
                  {r.type === 'forms' && <FormRow x={x} />}
                  {r.type === 'payments' && <PaymentRow x={x} />}
                </li>
              ))}

              {!loading && (!r.data || r.data.length === 0) && (
                <li className="text-xs text-slate-400">No data</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Row renderers ---------- */

function CallRow({ x }) {
  return (
    <>
      <b className="capitalize">{x.client || '—'}</b>
      {x.phone ? <> — {x.phone}</> : null}
      <br />
      <span className="text-xs">
        {x.service ? `${x.service}` : ''}
        {x.service && x.date ? ' · ' : ''}
        {x.date ? formatDate(x.date) : ''}
      </span>
    </>
  )
}

function FormRow({ x }) {
  return (
    <>
      <b>Technician:</b> {x.technician || '—'} <br />
      <span className="text-xs">
        Client: {x.client || '—'}
        {x.service ? ` | ${x.service}` : ''}
        {x.status ? ` · ${x.status}` : ''}
        {x.date ? ` · ${formatDate(x.date)}` : ''}
      </span>
    </>
  )
}

function PaymentRow({ x }) {
  return (
    <>
      <b>{x.technician || '—'}</b>
      {' — '}
      {isFiniteNumber(x.amount) ? `₹${x.amount}` : '₹—'}
      <br />
      <span className="text-xs">
        Status: {x.status || '—'}
        {x.mode ? ` · ${x.mode}` : ''}
        {x.date ? ` · ${formatDate(x.date)}` : ''}
      </span>
    </>
  )
}

/* ---------- Helpers ---------- */

function StatCard({ label, value }) {
  return (
    <div className="card">
      <div className="text-slate-300">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  )
}

function RecentCount({ endpoint, today }) {
  const [count, setCount] = React.useState('—')
  useEffect(() => {
    api
      .get(endpoint, { params: { today: today ? 1 : undefined, limit: 1 } })
      .then(({ data }) => {
        const total =
          numberOrNull(data?.total) ??
          numberOrNull(data?.meta?.total) ??
          (Array.isArray(data?.items) ? data.items.length : null)
        setCount(total ?? '—')
      })
      .catch(() => setCount('—'))
  }, [])
  return <div className="text-3xl font-bold">{count}</div>
}

function numberOrNull(v) {
  return typeof v === 'number' && isFinite(v) ? v : null
}
function isFiniteNumber(v){ return typeof v === 'number' && isFinite(v) }
function firstOf(obj, keys = []) {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== '') return obj[k]
  }
  return undefined
}
function pickTechName(t) {
  if (!t) return undefined
  return firstOf(t, ['name','fullName','username']) || t
}
function validDateOrNull(raw) {
  const d = raw ? new Date(raw) : null
  return d && !isNaN(d.getTime()) ? d : null
}
function formatDate(d) {
  try { return d.toLocaleDateString() } catch { return '' }
}

/* ---------- Normalizers (handle different backend field names) ---------- */

function normalizeCall(x = {}) {
  return {
    id: x._id || x.id || Math.random().toString(36).slice(2),
    client: firstOf(x, ['clientName', 'name', 'customer', 'client']),
    phone: firstOf(x, ['clientPhone', 'phone', 'phoneNumber', 'mobile']),
    address: firstOf(x, ['address', 'clientAddress']),
    service: firstOf(x, ['service', 'serviceType', 'job', 'category', 'subject']),
    status: firstOf(x, ['status']),
    date: validDateOrNull(
      firstOf(x, ['assignedAt', 'createdAt', 'date', 'updatedAt'])
    ),
  }
}

function normalizeForm(x = {}) {
  const techName =
    pickTechName(x.technician) ||
    firstOf(x, ['technicianName', 'techName'])

  // payment could be nested or split (online/cash)
  const paymentTotal =
    numberOrNull(x.amount) ??
    numberOrNull(x?.payment?.total) ??
    ( (numberOrNull(x.onlineAmount) || 0) + (numberOrNull(x.cashAmount) || 0) )

  return {
    id: x._id || x.id || Math.random().toString(36).slice(2),
    technician: techName,
    client: firstOf(x, ['clientName', 'customer', 'name']),
    service: firstOf(x, ['serviceType', 'service', 'job']),
    status: firstOf(x, ['status']),
    payment: paymentTotal,
    date: validDateOrNull(firstOf(x, ['submittedAt','createdAt','date','updatedAt'])),
  }
}

function normalizePayment(x = {}) {
  const amount =
    numberOrNull(x.amount) ??
    ( (numberOrNull(x.onlineAmount) || 0) + (numberOrNull(x.cashAmount) || 0) ) ??
    numberOrNull(x?.payment?.total)

  const status =
    firstOf(x, ['status','state']) ||
    (amount ? 'Paid' : undefined)

  return {
    id: x._id || x.id || Math.random().toString(36).slice(2),
    technician:
      pickTechName(x.technician) ||
      firstOf(x, ['technicianName', 'techName']),
    amount,
    status,
    mode: firstOf(x, ['mode', 'paymentMode']),
    date: validDateOrNull(firstOf(x, ['createdAt','date','paidAt','updatedAt'])),
  }
}