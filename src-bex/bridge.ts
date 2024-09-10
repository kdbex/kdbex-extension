// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BexEventData, BexEventListener, BexEventMap, BexEventName, BexEventResponse, BexPayload } from '@quasar/app-vite';



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
    ServiceConnected: [KdbexEntry[] | null, string];//When bg is loaded, sends info to the current tab
    EntrySelected: [string, never];
    SecurizeUrl: [string, never];
    GetFields: [never, [string | undefined, string[]]];
    InputCheck: [string, string];
    ButtonCheck: [string, string];
    CurrentData: [never, [string, string] | null];
  }
}

export function tabsSend<T extends BexEventName>(
  eventName: T,
  ...payload: BexEventData<T> extends never ? [] : [BexEventData<T>]
): Promise<BexEventResponse<T>>{
  return new Promise(async (resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = (await chrome.tabs.query({active: true, currentWindow: true}))[0].id!;
    console.log('Sending to id', id);
    chrome.tabs.sendMessage(id, {
      eventName,
      payload
    }, function(response) {
      resolve(response);
    });
  });
}

export function tabsOn<T extends BexEventName>(eventName: T, listener: BexEventListener<T>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  chrome.runtime.onMessage.addListener(function(request, _sender, sendResponse) {
    if (request.eventName == eventName) {
      const payload = {} as BexPayload<BexEventData<T>, BexEventResponse<T>>;
      payload.data = request.payload.length > 0 ? request.payload[0] : undefined;
      payload.respond = sendResponse as BexEventResponse<T>;
      listener(payload);
    }
  });
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
  selected: string;
}