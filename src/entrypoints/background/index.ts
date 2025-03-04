import { Router } from "@/utils/routing";
import { registerMessageCallbacks } from "./messaging";
import { onTabChanged } from "./tab";

export default defineBackground(() => {
  //We register tab listening
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const [tab] = tabs;
    if(tab) {
        onTabChanged({ tabId: tab.id!!, windowId: tab.windowId });
    }
  });
  chrome.tabs.onActivated.addListener(onTabChanged);
  //We register all messages handlers
  registerMessageCallbacks();
});

let router: Router;

export function getRouter(): Router {
  return router;
}

export function setRouter(_router: Router) {
  router = _router;
  sendMessage("refreshPopup", router);
}
