//function to generate 10 digits random hex code using crypto
import * as crypto from 'crypto';
export function generateHexCode(): string {
  const buffer = crypto.randomBytes(5); // 5 bytes = 10 hex digits
  
  // Convert buffer to hex string
  const hexCode = buffer.toString('hex');
  return hexCode;
}