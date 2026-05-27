import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function validateKey() {
  const encryptionKey = process.env.ENCRYPTION_KEY?.trim();
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is missing.');
  }

  if (encryptionKey.length !== 64) {
    throw new Error(`ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Current length: ${encryptionKey.length}`);
  }

  try {
    const key = Buffer.from(encryptionKey, 'hex');
    if (key.length !== 32) {
      throw new Error(`ENCRYPTION_KEY decoded to ${key.length} bytes, but 32 bytes are required.`);
    }
    return key;
  } catch (e: any) {
    throw new Error(`Failed to parse ENCRYPTION_KEY as hex: ${e.message}`);
  }
}

export function encrypt(text: string): string {
  if (!text) {
    console.error('Encryption Error: Attempted to encrypt empty/null text');
    throw new Error('Text to encrypt is required');
  }

  const key = validateKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  const result = `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  console.log('Encryption successful. Result length:', result.length);
  return result;
}

export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error('Encrypted data is required for decryption');
  }

  const key = validateKey();
  const parts = encryptedData.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format. Expected iv:tag:encrypted');
  }

  const [ivHex, tagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
