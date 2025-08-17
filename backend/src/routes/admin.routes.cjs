const express = require('express');
const { authGuard, requireRole } = require('../utils/auth.cjs');
const ForwardedCall = require('../models/ForwardedCall.cjs');
const ServiceForm = require('../models/ServiceForm.cjs');
const PaymentRecord = require('../models/PaymentRecord.cjs');
const User = require('../models/User.cjs');

const router = express.Router();
router.use(authGuard, requireRole('admin'));

// Forward a call to technician
router.post('/forward-call', async (req, res) => {
  const { clientName, clientPhone, address, technicianId } = req.body || {};
  const call = await ForwardedCall.create({
    clientName, clientPhone, address,
    assignedTo: technicianId,
    assignedBy: req.user._id
  });
  // Real-time notify the technician
  try {
    req.io?.to(`user:${technicianId}`).emit('new-call', { callId: call._id, clientName, clientPhone, address });
  } catch (e) {}
  res.json({ message: 'Call forwarded', call });
});

// List forwarded calls with filters
router.get('/forwarded-calls', async (req, res) => {
  const { page=1, limit=10, q='', today, from, to, technicianId, status } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [
      { clientName: new RegExp(q, 'i') },
      { clientPhone: new RegExp(q, 'i') },
      { address: new RegExp(q, 'i') }
    ];
  }
  if (technicianId) filter.assignedTo = technicianId;
  if (status) filter.status = status;
  if (today === '1') {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    filter.createdAt = { $gte: start, $lte: end };
  }
  if (from && to) {
    filter.createdAt = { $gte: new Date(from), $lte: new Date(to) };
  }

  const total = await ForwardedCall.countDocuments(filter);
  const items = await ForwardedCall.find(filter)
    .sort({ createdAt: -1 })
    .skip((+page-1)*(+limit))
    .limit(+limit)
    .populate('assignedTo', 'name username');
  res.json({ total, items });
});

// Service forms listing
router.get('/service-forms', async (req, res) => {
  const { page=1, limit=10, q='', today, from, to, status, technicianId } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [
      { clientName: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') },
      { clientAddress: new RegExp(q, 'i') }
    ];
  }
  if (status) filter.status = status;
  if (technicianId) filter.technician = technicianId;
  if (today === '1') {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    filter.submittedAt = { $gte: start, $lte: end };
  }
  if (from && to) {
    filter.submittedAt = { $gte: new Date(from), $lte: new Date(to) };
  }
  const total = await ServiceForm.countDocuments(filter);
  const items = await ServiceForm.find(filter)
    .sort({ submittedAt: -1 })
    .skip((+page-1)*(+limit))
    .limit(+limit)
    .populate('technician', 'name username');
  res.json({ total, items });
});

// Payments listing
router.get('/payments', async (req, res) => {
  const { page=1, limit=10, q='', today, from, to, technicianId } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [
      { payeeName: new RegExp(q, 'i') }
    ];
  }
  if (technicianId) filter.technician = technicianId;
  if (today === '1') {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    filter.createdAt = { $gte: start, $lte: end };
  }
  if (from && to) {
    filter.createdAt = { $gte: new Date(from), $lte: new Date(to) };
  }
  const total = await PaymentRecord.countDocuments(filter);
  const items = await PaymentRecord.find(filter)
    .sort({ createdAt: -1 })
    .skip((+page-1)*(+limit))
    .limit(+limit)
    .populate('technician', 'name username');
  res.json({ total, items });
});

// Technicians with brief stats
router.get('/technicians', async (req, res) => {
  const techs = await User.find({ role: 'technician' }).select('name username phone createdAt');
  res.json({ items: techs });
});

// Technician detail (collections & work by date range)
router.get('/technicians/:id/summary', async (req, res) => {
  const { from, to } = req.query;
  const filter = { technician: req.params.id };
  if (from && to) {
    filter.createdAt = { $gte: new Date(from), $lte: new Date(to) };
  }
  const [forms, payments] = await Promise.all([
    ServiceForm.find(filter),
    PaymentRecord.find(filter)
  ]);
  const totalCollection = payments.reduce((s, p) => s + (p.onlineAmount||0) + (p.cashAmount||0), 0);
  res.json({
    totalJobs: forms.length,
    totalCollection,
    forms,
    payments
  });
});

module.exports = router;
