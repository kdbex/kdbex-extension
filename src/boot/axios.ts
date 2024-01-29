import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { MessageType } from 'app/src-bex/communication';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

let baseUrl: string;
let token: string;

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
      console.log('Got base url', data);
      baseUrl = data;
    });
    $q.bex.on(MessageType.UPDATE_TOKEN, ({ data }) => {
      console.log('Got token', data);
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
