import { storage } from "wxt/storage"

export const storageHasSetup = storage.defineItem<boolean>(
    'local:hasSetup',
    {
        fallback: false
    }
)
export const storageServerUrl = storage.defineItem<string>(
    'local:server'
)
export const storageToken = storage.defineItem<string>(
    'local:token'
)

export async function getToken() {
    return (await storageToken.getValue())!!;
}

export async function getURL() {
    return (await storageServerUrl.getValue())!!;
}