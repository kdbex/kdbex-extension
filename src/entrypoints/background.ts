import { encrypt } from "@/utils/crypt";
import { onMessage } from "../utils/messaging";
import { storageHasSetup } from "@/utils/storage";
import { Router } from "@/utils/routing";
import { KdbexEntry } from "@/utils/model";

function generatePassword(): string {
  const lowCase = "abcdefghijklmnopqrstuvxyz";
  const upCase = "ABCDEFGHIJKLMNOPQRSTUVXYZ";
  const numbers = "0123456789";
  const spec = "£$&()*+[]@#^-_!?";
  const arrays = [lowCase, upCase, numbers, spec];
  let size = 20;
  let pw = "";
  for (let i = 0; i < size; i++) {
    let arr = arrays[Math.floor(arrays.length * Math.random())];
    pw += arr.charAt(Math.floor(arr.length * Math.random()));
  }
  return pw;
}

async function post(
  url: string,
  body: any,
  json: boolean = true
): Promise<number | any> {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      Authorization: sessionToken,
    },
    body: JSON.stringify(body),
  });
  return response.ok
    ? await (json ? response.json() : response.text())
    : response.status;
}

async function get(url: string, json: boolean = true): Promise<number | any> {
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      Authorization: sessionToken,
    },
  });
  return response.ok
    ? await (json ? response.json() : response.text())
    : response.status;
}

var router: Router;
var sessionToken: string;

var currentTab: number;
var tabData: {
  [key: number]: {
    entries: KdbexEntry[];
    fields: number;
    selected: string;
    url: string;
    code: number;
  };
} = {};

export default defineBackground(() => {
  browser.tabs.onActivated.addListener(async (data) => {
    currentTab = data.tabId;
  });
  onMessage("testSetup", async ({ data }) => {
    let message = generatePassword();
    const setup: boolean = await post(data.url + "/setup", {
      message: message,
      hash: encrypt(message, data.token),
    });
    return setup;
  });
  onMessage("validateSetup", async ({ data }) => {
    storageHasSetup.setValue(true);
    storageServerUrl.setValue(data.url);
    storageToken.setValue(data.token);
    sendMessage("refreshPopup", Router.Login);
  });
  onMessage("getPopup", async () => {
    if (router) {
      return router;
    }
    let loaded = await storageHasSetup.getValue();
    return loaded ? Router.Login : Router.Setup;
  });
  onMessage("login", async ({ data }) => {
    let hash = encrypt(data, await getToken());
    let value = await post((await getURL()) + "/login", { key: hash }, false);
    if (typeof value == "number") {
      return false;
    } else {
      sessionToken = value;
      router = Router.Main;
      sendMessage("refreshPopup", Router.Main);
      return true;
    }
  });
  onMessage("queryTabData", async ({ data }) => {
    if (sessionToken == undefined) {
      //We are not logged, so do not do anything
      return undefined;
    }
    if (
      tabData[currentTab] == undefined ||
      tabData[currentTab].url != data.url ||
      tabData[currentTab].code != data.code
    ) {
      //No current entry in memory or the url changed or the code changed
      let value = await get(
        (await getURL()) + `/entries/url/${data.url}/${data.code}`
      );
      if (typeof value == "number") {
        //Bad response, we stop
        return undefined;
      }
      const arr = value as KdbexEntry[];
      const prev = tabData[currentTab];
      tabData[currentTab] = {
        entries: arr,
        fields: data.fields,
        selected: prev && prev.url == data.url ? prev.selected : arr[0].id,
        url: data.url,
        code: data.code,
      };
    }
    const v = tabData[currentTab].entries.find(
      (e) => e.id == tabData[currentTab].selected
    )!!;
    return {
      username: v.username ? v.username : "",
      password: v.passwordHash ? decrypt(v.passwordHash, await getToken()) : "",
    };
  });
  onMessage("queryPopupData", async () => {
    const currentData = tabData[currentTab];
    return {
      fields: currentData.fields,
      entries: currentData.entries.map((e) => {
        return { id: e.id, name: e.name };
      }),
      selected: currentData.selected,
    };
  });
  onMessage("updateSelection", async ({ data }) => {
    tabData[currentTab].selected = data;
  });
});
