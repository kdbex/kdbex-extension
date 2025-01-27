/**
 * Crypting file to encrypt and decrypt files
 */
import CryptoJS from 'crypto-js';

export function ivkey(pass: string): [string, string] {
	let [key, iv] = pass.split(":");
	return [key, iv];
}
// Function to encrypt data
export function encrypt(data: string, pass: string) {
    const [key, iv] = ivkey(pass);
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Base64.parse(key), {
        iv: CryptoJS.enc.Base64.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.ciphertext.toString(CryptoJS.enc.Hex); // Output encrypted data as Hex
}

// Function to decrypt data
export function decrypt(encryptedData: string, pass: string) {
    const [key, iv] = ivkey(pass);

    const encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedData); // Parse Hex string
    const encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr); // Convert to Base64 for CryptoJS

    const decrypted = CryptoJS.AES.decrypt(encryptedBase64Str, CryptoJS.enc.Base64.parse(key), {
        iv: CryptoJS.enc.Base64.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8); // Convert decrypted data to UTF-8
}