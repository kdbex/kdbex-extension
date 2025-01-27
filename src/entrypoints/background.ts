import { encrypt } from "@/utils/crypt";
import { onMessage } from "../utils/messaging";
import { storageHasSetup } from "@/utils/storage";
import { Router } from "@/utils/routing";


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

async function post(url: string, body: any): Promise<number | any> {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(body),
    })
    return response.ok ? await response.json() : response.status;
}

var router: Router;

export default defineBackground(() => {
  onMessage('testSetup', async ({ data }) =>{
    let message = generatePassword()
    const setup: boolean = await post(data.url + '/setup', { message: message, hash: encrypt(message, data.token) });
    return setup;
  });
  onMessage('validateSetup', async ({ data }) =>{ 
    storageHasSetup.setValue(true)
    storageServerUrl.setValue(data.url)
    storageToken.setValue(data.token)
    sendMessage('movePopup', Router.Login)
  });
  onMessage('getPopup', async () => {
    if(router) {
      return router;
    }
    let loaded = await storageHasSetup.getValue();
    return loaded ? Router.Login : Router.Setup;
  });
});
