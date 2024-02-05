import { BexBridge } from '@quasar/app-vite';
import crypto from 'crypto-es';

export function encrypt(message: string, key: string): string {
  const decrypt = crypto.AES.encrypt(message, key);
  return decrypt.toString();
}

export function decrypt(hash: string, key: string): string {
  const bytes = crypto.AES.decrypt(hash, key);
  return bytes.toString(crypto.enc.Utf8);
}

type HttpBody<T extends boolean> = T extends true ? unknown : string;

export async function get<T extends boolean>(bridge: BexBridge, url: string, json: T = true as T): Promise<HttpBody<T>> {
  return http(bridge, url, 'GET', {}, json)
}

export async function post<T extends boolean>(bridge: BexBridge, url: string, data: { [key: string]: string }, json: T = true as T): Promise<HttpBody<T>> {
  return http(bridge, url, 'POST', data, json)
}

async function http<T extends boolean>(bridge: BexBridge, url: string, method: 'GET' | 'POST', data: { [key: string]: string }, json: T = true as T): Promise<HttpBody<T>> {
  const d = (await bridge.send('Http', { url, method, data, json })).data as { data: HttpBody<T>, error: boolean };
  if (d.error) {
    return Promise.reject(d.data);
  }
  return Promise.resolve(d.data);
}