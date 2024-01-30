import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { MessageType } from 'app/src-bex/communication';
import { encrypt } from 'src/components/model';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

let baseUrl: string;
let token: string;
let cryptKey: string;

const api = axios.create();
export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  const $q = app.config.globalProperties.$q;
  const waitForBex = new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if ($q.bex) {
        clearInterval(interval);
        resolve();
      }
    }, 100); // Check every 100ms
  });
  waitForBex.then(() => {
    $q.bex.send(MessageType.GET_LOG_INFO, {}).then(({ data }) => {
      baseUrl = data.url;
      cryptKey = data.cryptKey;
    });
    $q.bex.on(MessageType.UPDATE_TOKEN, ({ data }) => {
      token = data;
    });
  });
  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});
api.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    if (baseUrl) {
      console.log('Has baseUrl', baseUrl);
      config.url = baseUrl + config.url;
    }
    console.log(config.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = {}; // Specify a more specific type for obj
    for (const key in config.data) {
      if (key.endsWith('TH')) {
        obj[key.substring(0, key.length - 2)] = encrypt(
          config.data[key],
          cryptKey
        );
      } else {
        obj[key] = config.data[key];
      }
    }
    config.data = obj;
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

export { api };
