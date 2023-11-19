import crypto from 'crypto-es';

export function encrypt(message: string, key: string): string {
  const decrypt = crypto.AES.encrypt(message, key);
  return decrypt.toString();
}

export function decrypt(hash: string, key: string): string {
  const bytes = crypto.AES.decrypt(hash, key);
  return bytes.toString(crypto.enc.Utf8);
}
