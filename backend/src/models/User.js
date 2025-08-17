import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'technician'], required: true },
  phone: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
