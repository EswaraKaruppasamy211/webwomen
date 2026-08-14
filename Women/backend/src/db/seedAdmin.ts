import readline from 'readline';
import { db } from './database';
import { hashPassword } from '../utils/security';
import { config } from '../config';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('\n======================================================');
  console.log('🛡️  SafeHer AI – Admin Seed & Security Provisioning');
  console.log('======================================================\n');

  const email = (await question(`Admin Email [${config.adminDefaultEmail}]: `)) || config.adminDefaultEmail;
  const name = (await question('Admin Full Name [System Administrator]: ')) || 'System Administrator';
  const password = (await question(`Admin Password [${config.adminDefaultPassword}]: `)) || config.adminDefaultPassword;

  if (password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long.');
    rl.close();
    process.exit(1);
  }

  const existingUser = db.getUserByEmail(email);
  const passwordHash = await hashPassword(password);

  if (existingUser) {
    await db.updateUser(existingUser.id, {
      name,
      passwordHash,
      role: 'ADMIN',
    });
    console.log(`\n✅ Existing user ${email} promoted/updated to ADMIN role successfully.`);
  } else {
    const newUser = await db.createUser({
      name,
      email,
      phone: '+1-800-555-SAFE',
      passwordHash,
      role: 'ADMIN',
    });
    console.log(`\n✅ New Administrator account created with ID: ${newUser.id}`);
  }

  await db.createAuditLog({
    actorId: 'SYSTEM',
    actorName: 'CLI Provisioner',
    actorRole: 'SYSTEM',
    action: 'ADMIN_PROVISIONED',
    details: `Admin account provisioned for ${email}`,
  });

  console.log('\n🔐 Credentials Summary:');
  console.log(`- Email: ${email}`);
  console.log(`- Role: ADMIN`);
  console.log(`- Status: Active & Secured\n`);

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error during admin seeding:', err);
  rl.close();
  process.exit(1);
});
