import { bexBackground } from 'quasar/wrappers';
import { KdbexEntry, Status, TabData } from './bridge';
import { httpData, get, customhttp } from './http';
let status: Status = Status.SETUP;
let loaded = false;
const loaders: ((status: Status) => void)[] = [];
const tabs: { [index: number]: TabData } = {}; //The pages that are currently loaded
let tabIndex = 0; //The tab that is currently active
let secureUrls: string[] = [];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(
    ['status', 'url', 'cryptKey', 'secureUrls'],
    (result) => {
      if (result.status) {
        status = result.status;
      }
      if (result.url) {
        httpData.burl = result.url;
      }
      if (result.cryptKey) {
        httpData.cryptKey = result.cryptKey;
      }
      if (result.secureUrls) { 
        secureUrls = result.secureUrls;
      }
      loaded = true;
      loaders.forEach((l) => l(status));
    }
  );
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

export async function checkCurrentTab(): Promise<KdbexEntry[] | null> {
  const current = tabs[tabIndex];
  if (status !== Status.CONNECTED) {
    return null;
  }
  if (
    current && //Current tab is loaded (not a shitty chrome://extensions)
    current.need_data && //has fields
    !current.has_data && //no data filled yet
    status == Status.CONNECTED && //We are connected
    !secureUrls.includes(current.url) //Url does not need a reauthentification
  ) {
    return get(`/entries/url/${current.url}/${current.need_data}`).then(
      (r) => r as KdbexEntry[]
    );
  }
  return [];
}

export default bexBackground((bridge) => {
  bridge.on('GetStatus', ({ respond }) => {
    console.log('GetStatus', loaded, status);
    if (!loaded) {
      loaders.push(respond);
    } else {
      respond(status);
    }
  });
  bridge.on('Http', ({ data, respond }) => {
    customhttp(data.url, data.method, data.data, data.json)
      .then((r) => {
        respond({ data: r, error: false });
      })
      .catch((e) => {
        respond({ data: parseInt(e.message), error: true });
      });
  });
  bridge.on('Connect', async ({ data }) => {
    httpData.token = data;
    status = Status.CONNECTED;
    bridge.send('UpdateStatus', Status.CONNECTED);
    bridge.send('ServiceConnected', await checkCurrentTab());
  });
  bridge.on('Setup', ({ data }) => {
    status = Status.LOGIN;
    //We store the url
    chrome.storage.local.set({
      status: Status.LOGIN,
      url: data.url,
      cryptKey: data.cryptKey,
    });
    bridge.send('UpdateStatus', Status.LOGIN);
  });
  bridge.on('PageLoaded', async ({ data, respond }) => {
    tabs[tabIndex] = data as TabData;
    tabs[tabIndex].has_data = false;
    tabs[tabIndex].need_data =
      (data.need_username ? 1 : 0) + (data.need_password ? 2 : 0);
    respond(await checkCurrentTab());
  });
  bridge.on('PageUpdated', async ({ data, respond }) => {
    tabs[tabIndex] = data as TabData;
    tabs[tabIndex].need_data =
      (data.need_username ? 1 : 0) + (data.need_password ? 2 : 0);
    respond(await checkCurrentTab());
  });
  bridge.on('SecurizeUrl', ({ data}) => {
    if (secureUrls.includes(data)) {
      secureUrls = secureUrls.filter((u) => u !== data);
    } else {
      secureUrls.push(data);
    }
    chrome.storage.local.set({
      secureUrls
    })
  });
  bridge.on('CurrentData', ({respond}) => {
    const data = tabs[tabIndex];
    respond(data ? [data.url, data.selected] : null);
  });
  bridge.on('EntrySelected', ({ data }) => {
    tabs[tabIndex].selected = data;
  });
});
