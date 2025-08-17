import mongoose from 'mongoose';

const forwardedCallSchema = new mongoose.Schema({
  clientName: String,
  clientPhone: String,
  address: String,
  status: { type: String, enum: ['Pending', 'In Process', 'Completed', 'Closed'], default: 'Pending' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('ForwardedCall', forwardedCallSchema);
