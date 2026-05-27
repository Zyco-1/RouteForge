import { randomBytes } from 'crypto';

function generateKey() {
  const key = randomBytes(32).toString('hex');
  console.log('Generated 32-byte Encryption Key:');
  console.log(key);
  console.log('\nAdd this to your Vercel Environment Variables as ENCRYPTION_KEY');
}

generateKey();
