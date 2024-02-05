// Hooks added here have a bridge allowing communication between the BEX Content Script and the Quasar Application.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/content-hooks

import { bexContent } from 'quasar/wrappers';
import { Field } from './field';
import { getMatches, labelInput, observe } from './dom-search';
import { BexBridge } from '@quasar/app-vite';
import { KdbexEntry } from './bridge';
window.addEventListener('load', () => onPageLoaded());
const url = window.location.href.split('://')[1].split('/')[0];

export enum TabState {
  DATA,
  NODATA,
  NOLOG,
}

export const shared = {
  bridge: null as unknown as BexBridge,
  fields: [] as Field[],
  status: TabState.NOLOG,
  entries: [] as KdbexEntry[],
  selectedEntry: undefined as KdbexEntry | undefined,
  button: undefined as HTMLElement | undefined,
  refreshFields: function () {
    this.fields.forEach((field) => field.refreshField());
  },
  closeFields: function () {
    this.fields.forEach((field) => (field.opened = false));
  },
  fillEntry: function (entry: KdbexEntry) {
    this.selectedEntry = entry;
    this.fields.forEach((field) => {
      field.input.value = field.pw ? entry.password : entry.username;
    });
  },
  sendTabInfo: function (loaded: boolean) {
    this.refreshFields();
    const nu = shared.fields.filter((f) => f.pw === false).length > 0;
    const np = shared.fields.filter((f) => f.pw === true).length > 0;
    shared.bridge.send(loaded ? 'PageLoaded' : 'PageLoaded', {
      url,
      need_username: nu,
      need_password: np,
    }).then(({ data }) => fillEntry(data));
  }
};
export default bexContent((bridge) => {
  shared.bridge = bridge;
  bridge.on('ServiceConnected', ({ data}) => {
    fillEntry(data);
  });
});

function fillEntry(data: KdbexEntry[] | null) {
  shared.status = shared.button ? TabState.DATA : TabState.NODATA;
  shared.refreshFields();
  if (data) {
    console.log('data sent is', data);
    shared.entries = data;
    shared.fillEntry(shared.entries[0]);
  }
}

//Functions to communicate with the others files

function onPageLoaded() {
  new MutationObserver(observe).observe(document.body, {
    subtree: true,
    childList: true,
  });
  addEventListener('resize', () => {
    shared.refreshFields();
  });
  const matches = getMatches(document.body, [null, []]);
  if (matches[0]) {
    shared.button = matches[0];
    matches[1].forEach((match) => labelInput(match));
    shared.refreshFields();
  } 
  shared.sendTabInfo(true);
  /*shared.bridge
    .send(MessageType.PAGE_LOADED, {
      url,
      need_username: true,
      need_password: true,
    })
    .then(({ data }) => {
      if (data !== null) {
        shared.entries = data;
        shared.fillEntry(shared.entries[0]);
      }
    });*/
}
