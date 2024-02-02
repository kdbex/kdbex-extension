import { bexBackground } from 'quasar/wrappers';
import { MessageType, Status, TabData } from './communication';
import { httpData, get, customhttp } from './http';

let status: Status = Status.SETUP;
let loaded = false;
const loaders: ((status: Status) => void)[] = [];
const tabs: { [index: number]: TabData }  = {};//The pages that are currently loaded
let tabIndex = 0;//The tab that is currently active

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['status', 'url', 'cryptKey'], (result) => {
    if (result.status) {
      status = result.status;
    }
    if (result.url) {
      httpData.burl = result.url;
    }
    if (result.cryptKey) {
      httpData.cryptKey = result.cryptKey;
    }
    loaded = true;    
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

export function checkCurrentTab() {
  const current = tabs[tabIndex];
  if (current && current.need_data && !current.has_data && status == Status.CONNECTED) {
    get(`/entries/url/${current.url}/${current.need_data}`).then((r) => console.log('Tab output check', r));
}
}

export default bexBackground((bridge) => {
  bridge.on(MessageType.GET_STATUS, ({ respond }) => {
    if (!loaded) {
      loaders.push(respond);
    } else {
      respond(status);
    }
  });
  bridge.on(MessageType.HTTP, ({ data, respond }) => {
    customhttp(data.url, data.method, data.data, data.json).then((r) => {
      respond({ data: r, error: false })
    }).catch((e) => {
      respond({data: parseInt(e.message), error: true})
    })
  });
  bridge.on(MessageType.SET_STATUS, ({ data }) => {
    status = data;
    bridge.send(MessageType.UPDATE_STATUS, data);
    if (status == Status.CONNECTED) {
      checkCurrentTab();
    }
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
    tabs[tabIndex] = data as TabData;
    tabs[tabIndex].has_data = false;
    tabs[tabIndex].need_data = (data.need_username ? 1 : 0) + (data.need_password ? 2 : 0);
    checkCurrentTab();
  })
});
