import { defineExtensionMessaging } from '@webext-core/messaging';
import { Router } from './routing';

interface ProtocolMap {
  testSetup(data: {url: string, token: string}): Promise<boolean>;
  validateSetup(data: {url: string, token: string}): void;
  refreshPopup(data: Router): void;
  getPopup(): Promise<Router>;
  login(data: string): Promise<boolean>;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
