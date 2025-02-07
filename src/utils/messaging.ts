import { defineExtensionMessaging } from '@webext-core/messaging';
import { Router } from './routing';
import { KdbexEntry } from './model';

interface ProtocolMap {
  testSetup(data: {url: string, token: string}): boolean;
  validateSetup(data: {url: string, token: string}): void;
  refreshPopup(data: Router): void;
  getPopup(): Router;
  login(data: string): Promise<boolean>;
  queryTabData(data: {url: string, code: number}): {username: string, password: string} | undefined;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
