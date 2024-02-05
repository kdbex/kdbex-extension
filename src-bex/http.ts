import { decrypt, encrypt } from 'src/components/model';

export const httpData = {
    burl: '',
    cryptKey: '',
    token: ''
}

function request(data: { [key: string]: string }): unknown {
        const obj: { [key: string]: unknown } = {};
        for (const key in data) {
            if (key.endsWith('TH')) {
                obj[key.substring(0, key.length - 2)] = encrypt(
                    data[key],
                    httpData.cryptKey
                );
            } else {
                obj[key] = data[key];
            }
        }
        return obj;
}
function response(data: { [key: string]: unknown }): unknown {
  const obj: { [key: string]: unknown } = {};
  for (const key in data) {
    if(typeof(data[key]) !== 'string') {
      const cp = data[key] as { [key: string]: unknown };
      obj[key] = response(cp);
    } else if (key.endsWith('Hash')) {
      console.log('ui')
      obj[key.substring(0, key.length - 4)] = decrypt(
          data[key] as string,
          httpData.cryptKey
      );
    } else {
      obj[key] = data[key];
    }
  }
  return obj;
}


type HttpBody<T extends boolean> = T extends true ? unknown : string;

export async function get<T extends boolean>(url: string, json: T = true as T): Promise<HttpBody<T>> {
  return customhttp(url, 'GET', {}, json);
}

export async function post<T extends boolean>(url: string, data: { [key: string]: string }, json: T = true as T): Promise<HttpBody<T>> {
  return customhttp(url, 'POST', data, json);
}

export async function customhttp<T extends boolean>(url: string, method: 'GET' | 'POST', data: { [key: string]: string }, json: T = true as T): Promise<HttpBody<T>> {
  const options = {
    method,
    headers: {
        'Authorization': httpData.token,
        'Content-Type': 'application/json'
    }
  } as { method: string, headers: { [key: string]: string }, body?: BodyInit };
  if (method === 'POST') {
    options['body'] = JSON.stringify(request(data));
  }
  return fetch(httpData.burl + url, options).then(async (r) => {
    if (r.status !== 200) {
      console.debug('HTTP ERROR ON', r);
      throw new Error(r.status.toString());
    }
    if (json) {
      return response(await r.json()) as HttpBody<T>;
    }
    return r.text()
  })
}