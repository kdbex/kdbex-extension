import { bexBackground } from 'quasar/wrappers';
import { MessageType, Status } from './communication';

let status: Status = Status.SETUP;
let loaded = false;
const loaders: ((status: Status) => void)[] = [];
let axiosLoader: (data: { url: string; cryptKey: string }) => void;
let baseUrl = '';
let cryptKey = '';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Background script launched');
  chrome.storage.local.get(['status', 'url', 'cryptKey'], (result) => {
    if (result.status) {
      status = result.status;
    }
    if (result.url) {
      baseUrl = result.url;
    }
    if (result.cryptKey) {
      cryptKey = result.cryptKey;
    }
    if (axiosLoader) {
      axiosLoader({ url: baseUrl, cryptKey });
    }
    loaded = true;
    for (const loader of loaders) {
      loader(status);
    }
  });
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
      respond({ url: baseUrl, cryptKey });
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
});
