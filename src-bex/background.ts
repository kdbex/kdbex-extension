import { bexBackground } from 'quasar/wrappers';
import { MessageType, Status, PageBody } from './communication';

let status: Status = Status.SETUP;
let loaded = false;
const loaders: ((status: Status) => void)[] = [];
let axiosLoader: (data: { url: string; cryptKey: string }) => void;
const axiosData = { url: '', cryptKey: '' };
const tabs: { [index: number]: PageBody }  = {};//The pages that are currently loaded
let tabIndex = 0;//The tab that is currently active

chrome.runtime.onInstalled.addListener(() => {
  console.log('Background script launched');
  chrome.storage.local.get(['status', 'url', 'cryptKey'], (result) => {
    if (result.status) {
      status = result.status;
    }
    if (result.url) {
      axiosData.url = result.url;
    }
    if (result.cryptKey) {
      axiosData.cryptKey = result.cryptKey;
    }
    if (axiosLoader) {
      axiosLoader(axiosData);
    }
    loaded = true;
    for (const loader of loaders) {
      loader(status);
    }
  });
});

chrome.tabs.query({ currentWindow: true, active: true }).then((rtabs) => {
	const id = rtabs[0].id;
  if (id) {
    tabIndex = id;
  }
});
chrome.tabs.onActivated.addListener((active) => {
	tabIndex = active.tabId;
});

export default bexBackground((bridge) => {
  bridge.on(MessageType.GET_STATUS, ({ respond }) => {
    if (!loaded) {
      loaders.push(respond);
    } else {
      respond(status);
    }
  });
  bridge.on(MessageType.GET_LOG_INFO, ({ respond }) => {
    if (!loaded) {
      axiosLoader = respond;
    } else {
      respond(axiosData);
    }
  });
  bridge.on(MessageType.SET_STATUS, ({ data }) => {
    status = data;
    bridge.send(MessageType.UPDATE_STATUS, data);
  });
  bridge.on(MessageType.CORRECT_SETUP, ({ data }) => {
    status = Status.LOGIN;
    //We store the url
    chrome.storage.local.set({
      status: Status.LOGIN,
      url: data.url,
      cryptKey: data.cryptKey,
    });
    bridge.send(MessageType.UPDATE_STATUS, Status.LOGIN);
  });
  bridge.on(MessageType.PAGE_LOADED, ({ data }) => {
    const body = data as PageBody;
    tabs[tabIndex] = body;
  })
});
