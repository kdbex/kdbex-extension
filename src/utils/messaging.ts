import { defineExtensionMessaging } from '@webext-core/messaging';
import { Router } from './routing';
import { KdbexEntry } from './model';

interface ProtocolMap {
  testSetup(data: {url: string, token: string}): boolean;
  validateSetup(data: {url: string, token: string}): void;
  refreshPopup(data: Router): void;
  getPopup(): Router;
  login(data: string): Promise<boolean>;
  queryTabData(data: {url: string, code: number, fields: number}): {username: string, password: string} | undefined;
  queryPopupData(): PopupData | undefined;
  updateSelection(id: string): void;
  selectEntry(id: string): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();

export interface SharedEntry {
  id: string;
  name: string;
}

export interface PopupData {
  entries: SharedEntry[];
  fields: number;
  selected: string;
}