// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BexEventMap } from '@quasar/app-vite';

declare module '@quasar/app-vite' {
  interface BexEventMap {
    Connect: [string, never]; //The token used for the session
    GetStatus: [never, Status];
    UpdateStatus: [Status, never];
    Setup: [{ url: string; cryptKey: string }, never];
    Http: [
      {
        url: string;
        method: 'GET' | 'POST';
        data: { [key: string]: string };
        json: boolean;
      },
      { data: unknown | string; error: boolean }
    ];
    PageLoaded: [{ url: string, need_username: boolean, need_password: boolean }, KdbexEntry[] | null];
    PageUpdated: [{ url: string, need_username: boolean, need_password: boolean }, KdbexEntry[] | null];
    ServiceConnected: [KdbexEntry[] | null, never];//When bg is loaded, sends info to the current tab
    EntrySelected: [string, never];
  }
}

export interface KdbexEntry {
  id: string;
  name: string;
  password: string;
  username: string;
}

export enum Status {
  SETUP = 'Setup',
  LOGIN = 'Login',
  CONNECTED = 'Connected',
}

//Data in the background file that stores everything needed for each tab
export interface TabData {
  url: string;//The url of the tab
  need_data: number;//If the tab needs data (case if > 0)
  has_data: boolean; //If the tab has data
  need_username: boolean;
  need_password: boolean;
}