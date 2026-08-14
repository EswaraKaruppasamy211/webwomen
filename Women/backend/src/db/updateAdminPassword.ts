import { db } from './database';
import { hashPassword } from '../utils/security';

async function run() {
  const hash = await hashPassword('Eswara@2');
  const admin = db.getUserByEmail('admin@safeher.ai');
  if (admin) {
    await db.updateUser(admin.id, { passwordHash: hash });
    console.log('✅ Admin password updated to Eswara@2 successfully for', admin.email);
  } else {
    await db.createUser({
      name: 'System Administrator',
      email: 'admin@safeher.ai',
      phone: '+1-800-555-0199',
      passwordHash: hash,
      role: 'ADMIN',
    });
    console.log('✅ Created Admin account with password Eswara@2');
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
