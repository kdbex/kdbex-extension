import { generatePassword } from "@/utils/crypt";
import { SetupInfo, TabInfo } from "@/utils/messaging";
import { Router } from "@/utils/routing";
import { getRouter, setRouter } from ".";
import { Runtime } from "wxt/browser";
import { emptyTabData, getTab, setTab } from "./tab";
import { post, serverGet, serverPost, updateSessionToken } from "./http";
import { KdbexEntryInfo, KdbexEntryStore } from "@/utils/model";

export function registerMessageCallbacks() {
  onMessage("testSetup", async ({ data }) => testSetup(data));
  onMessage("validateSetup", async ({ data }) => validateSetup(data));
  onMessage("getPopup", async () => getPopup());
  onMessage("login", async ({ data }) => login(data));
  onMessage("setTabInfo", async ({ data, sender }) => setTabInfo(data, sender));
  onMessage("getEntriesByName", async ({ data }) => getEntriesByName(data));
  onMessage("updateEntryURL", async ({ data }) => updateEntryURL(data));
  onMessage("queryTabData", async () => getTab());
  onMessage("updateSelection", async ({ data }) => updateSelection(data));
}

async function testSetup(data: SetupInfo): Promise<boolean> {
  let message = generatePassword();
  const setup: boolean = await post(data.url + "/setup", {
    message: message,
    hash: encrypt(message, data.token),
  });
  return setup;
}

async function validateSetup(data: SetupInfo) {
  storageHasSetup.setValue(true);
  storageServerUrl.setValue(data.url);
  storageToken.setValue(data.token);
  sendMessage("refreshPopup", Router.Login);
}

async function getPopup(): Promise<Router> {
  const router = getRouter();
  if (router) {
    return router;
  }
  const loaded = await storageHasSetup.getValue();
  return loaded ? Router.Login : Router.Setup;
}

async function login(data: string) {
  let hash = encrypt(data, await getToken());
  let value = await serverPost("login", { key: hash }, false);
  if (typeof value == "number") {
    return false;
  } else {
    updateSessionToken(value);
    setRouter(Router.Main);
    if(getTab().url != "") {
      serverGet(`entries/url/${getTab().url}`).then((entries: KdbexEntryInfo[] | number) => {
        if(typeof entries == "number") return;
        setTab(Object.assign(getTab(), { entries: entries, selected: entries.length > 0 ? entries[0].id : undefined, queried: true }));
      });
    }
    return true;
  }
}

async function setTabInfo(data: TabInfo, sender: Runtime.MessageSender) {
  const tab = sender.tab!!;
  const tabId = tab.id!!;
  const lastUrl = getTab(tabId) ? getTab(tabId).url : "";
  if (lastUrl != data.url) {
    setTab(emptyTabData(), tabId);
    //We query the entries that one can field
    serverGet(`entries/url/${data.url}`).then((entries: KdbexEntryInfo[] | number) => {
      if(typeof entries == "number") return;

      setTab(Object.assign(getTab(tabId), { entries: entries, selected: entries.length > 0 ? entries[0].id : undefined, queried: true }), tabId);
    });
  }
  const tabData = Object.assign(getTab(tabId), { ...data, favicon: tab.favIconUrl!! });
  setTab(tabData, tabId);
}

async function getEntriesByName(data: string) {
  return serverGet(`entries/name/${data}`);
}

async function updateEntryURL(uuid: string) {
  const favicon = getTab().favicon;
  serverPost('entries/update', {
    uuid: uuid,
    url: getTab().url,
    faviconUrl: favicon
  } as KdbexEntryStore, false).then((r) => {
    console.log(r)
  });
}
function updateSelection(data: string) {
  setTab(Object.assign(getTab(), { selected: data }));
}

