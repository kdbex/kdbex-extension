import { SharedEntry } from "@/utils/messaging";

export interface TabData {
  url: string;
  forms: number;
  favicon: string;
  entries: SharedEntry[];
  queried: boolean;
  selected: string | undefined;
}

let currentTabId: number;
let tabData: { [key: number]: TabData } = {};

export function emptyTabData(): TabData {
  return { url: "", forms: 0, favicon: "", entries: [], selected: undefined, queried: false };
}

export function onTabChanged(data: chrome.tabs.TabActiveInfo) {
  console.debug(`Tab changed to ${data.tabId}`);
  currentTabId = data.tabId!!;
}

export function getTab(id = currentTabId) {
  return tabData[id];
}

export function setTab(tab: TabData, tabId = currentTabId) {
  console.debug(`Updating tab with id ${tabId} :`, tab)
  tabData[tabId] = tab;
}