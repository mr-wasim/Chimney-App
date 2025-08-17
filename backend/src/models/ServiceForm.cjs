const mongoose = require('mongoose');

const serviceFormSchema = new mongoose.Schema({
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: String,
  clientAddress: String,
  payment: { type: Number, default: 0 },
  phone: String,
  status: { type: String, enum: ['Services Done', 'Installation Done', 'Complaint Done', 'Under Process'], default: 'Under Process' },
  clientSignature: String, // base64
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ServiceForm', serviceFormSchema);
