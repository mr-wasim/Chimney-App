const express = require('express');
const { authGuard, requireRole } = require('../utils/auth.cjs');
const ServiceForm = require('../models/ServiceForm.cjs');
const ForwardedCall = require('../models/ForwardedCall.cjs');
const PaymentRecord = require('../models/PaymentRecord.cjs');

const router = express.Router();
router.use(authGuard, requireRole('technician'));

// Submit service form
router.post('/service-form', async (req, res) => {
  const { clientName, clientAddress, payment, phone, status, clientSignature } = req.body || {};
  const form = await ServiceForm.create({
    technician: req.user._id, clientName, clientAddress, payment, phone, status, clientSignature, submittedAt: new Date()
  });
  res.json({ message: 'Form submitted', form });
});

// List forwarded calls (tabs/filters + pagination)
router.get('/forwarded-calls', async (req, res) => {
  const { tab='all', page=1, limit=4 } = req.query; // default 4 per your spec
  const filter = { assignedTo: req.user._id };
  const now = new Date();
  if (tab === 'today') {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    filter.createdAt = { $gte: start, $lte: end };
  } else if (tab === 'pending') {
    filter.status = 'Pending';
  } else if (tab === 'completed') {
    filter.status = 'Completed';
  } else if (tab === 'closed') {
    filter.status = 'Closed';
  }
  const total = await ForwardedCall.countDocuments(filter);
  const items = await ForwardedCall.find(filter).sort({ createdAt: -1 }).skip((+page-1)*(+limit)).limit(+limit);
  res.json({ total, items });
});

// Update call status (pending/completed/closed/in process)
router.patch('/forwarded-calls/:id/status', async (req, res) => {
  const { status } = req.body || {};
  const allowed = ['Pending', 'In Process', 'Completed', 'Closed'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const call = await ForwardedCall.findOneAndUpdate(
    { _id: req.params.id, assignedTo: req.user._id },
    { status },
    { new: true }
  );
  res.json({ message: 'Status updated', call });
});

// Submit payment mode form
router.post('/payments', async (req, res) => {
  const { payeeName, mode, onlineAmount=0, cashAmount=0, recipientSignature, note } = req.body || {};
  if (!payeeName || !mode || !recipientSignature) return res.status(400).json({ message: 'Missing fields' });
  const payment = await PaymentRecord.create({
    technician: req.user._id, payeeName, mode, onlineAmount, cashAmount, recipientSignature, note
  });
  res.json({ message: 'Payment recorded', payment });
});

module.exports = router;
