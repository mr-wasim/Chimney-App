const mongoose = require('mongoose');

const paymentRecordSchema = new mongoose.Schema({
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payeeName: { type: String, required: true },
  mode: { type: String, enum: ['Online', 'Cash', 'Mixed'], required: true },
  onlineAmount: { type: Number, default: 0 },
  cashAmount: { type: Number, default: 0 },
  recipientSignature: { type: String, required: true }, // base64
  note: String
}, { timestamps: true });

paymentRecordSchema.virtual('total').get(function() {
  return (this.onlineAmount || 0) + (this.cashAmount || 0);
});

module.exports = mongoose.model('PaymentRecord', paymentRecordSchema);
