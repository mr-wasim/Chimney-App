import User from '../models/User.js';
import { hashPassword } from './auth.js';

export async function seedAdminIfNeeded() {
  const existing = await User.findOne({ role: 'admin', username: 'admin' });
  if (existing) return;
  const passwordHash = await hashPassword('Chimneysolution@123#');
  await User.create({
    name: 'Super Admin',
    username: 'admin',
    passwordHash,
    role: 'admin'
  });
  console.log('✅ Admin user seeded: username=admin, password=Chimneysolution@123#');
}
