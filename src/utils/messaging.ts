import { defineExtensionMessaging } from '@webext-core/messaging';
import { Router } from './routing';
import { KdbexEntry } from './model';
import { TabData } from '@/entrypoints/background/tab';

interface ProtocolMap {
  //Popup.Setup to Background, used to call server and verify that the token and server url is good
  testSetup(data: SetupInfo): boolean;
  //Popup.Setup to Background, stores in local storage the settings and goes to login popup
  validateSetup(data: SetupInfo): void;
  //Background to Popup, changes the popup's vue
  refreshPopup(data: Router): void;
  //Popup to Background, at init to initalize the popup (Setup or Login) depending on local storage values
  getPopup(): Router;
  //Popup.Login to Background, tries to login with a given password
  login(data: string): Promise<boolean>;
  //Content to Background, sets the tab info
  setTabInfo(data: TabInfo): void;
  //Popup.Main to Background, queries entries filtered by name
  getEntriesByName(name: string): SharedEntry[];
  //Popup.Main to Background, sets the url to a given entry
  updateEntryURL(id: string): void;
  //Popup.Main to Background, queries the tab information to show
  queryTabData(): TabData | undefined;
  //Popup.Main to Background, selects another entry
  updateSelection(id: string): void;//Used to update the entry that will be filled in the page
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();

export interface SetupInfo {
  url: string;
  token: string;
}

export interface SharedEntry {
  id: string;
  name: string;
}

export interface PopupData {
  entries: SharedEntry[];
  fields: number;
  selected: string;
}

export interface TabInfo {
  url: string;//url from the tab
  forms: number;//number of forms in the page
}