function requestInit(method: string): RequestInit {
  return {
    method: method,
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      Authorization: sessionToken,
    },
  };
}

async function cfetch(url: string, request: RequestInit) {
  console.debug(`[HTTP] Request at url ${url} with params ${request}`);
  const response = await fetch(url, request);
  console.debug(`[HTTP] Status: ${response.status}`);
  return response;
}

export async function serverPost(
  route: string,
  body: any,
  json: boolean = true
): Promise<number | any> {
  const url = (await getURL()) + "/" + route;
  const response = await cfetch(url, {
    ...requestInit("POST"),
    body: JSON.stringify(body),
  });
  return response.ok
    ? await (json ? response.json() : response.text())
    : response.status;
}

export async function serverGet(
  route: string,
  json: boolean = true
): Promise<number | any> {
  const url = (await getURL()) + "/" + route;
  const response = await cfetch(url, requestInit("GET"));
  return response.ok
    ? await (json ? response.json() : response.text())
    : response.status;
}

export async function post(url: string, body: any) {
  const response = await cfetch(url, {
    ...requestInit("POST"),
    body: JSON.stringify(body),
  });
  if (response.ok) {
    return await response.json();
  }
  return response.status;
}

let sessionToken: string;

export function updateSessionToken(_sessionToken: string) {
  sessionToken = _sessionToken;
}
