// Hooks added here have a bridge allowing communication between the BEX Content Script and the Quasar Application.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/content-hooks

import { bexContent } from 'quasar/wrappers'
import { Field } from './field';
import { getMatches, labelInput, observe } from './dom-search';
import { BexBridge } from '@quasar/app-vite';
import { MessageType, Status } from './communication';
window.addEventListener('load', () => onPageLoaded());
const url = window.location.href.split('://')[1].split('/')[0];

export const shared = {
	bridge: undefined as BexBridge | undefined,
	fields: [] as Field[],
	status: Status.SETUP,
	trueData: false,
	refreshFields: function () {
		this.fields.forEach(field => field.refreshField());
	},
	closeFields: function () {
		this.fields.forEach(field  => field.opened = false);
	}
}
export default bexContent((bridge) => {
  shared.bridge = bridge;
})

//Functions to communicate with the others files



function onPageLoaded() {
  	new MutationObserver(observe).observe(document.body, {subtree: true, childList: true});
	addEventListener('resize', () => {
		shared.refreshFields();
	});
	const matches = getMatches(document.body, [null, []]);
	console.log('Matches :', matches);
	matches[1].forEach((match) => labelInput(match));
	if (matches[0]) {
		shared.trueData = true;
		shared.refreshFields();
	}
	shared.bridge?.send(MessageType.PAGE_LOADED, {url, need_username: true, need_password: true});
	/*chrome.runtime.sendMessage(
		{
			request: {
				receiver: Script.BACKGROUND,
				sender: Script.CONTENT,
				code: MessageCode.PAGE_LOADED,
			},
			body: buildBody(),
		},
		(r: { logged: boolean; r: any }) => {
			if (r.logged) {
				//The page is not logged, but we don't know if the service isn't logged, or the page needs DA
				state = State.found;
				fill(r.r);
			} else {
				if (r.r) state = State.reauthenticate;
			}
		}
	);
	refreshFields();*/
}