import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ['storage', 'activeTab', 'tabs'],
  },
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-vue'],
  srcDir: 'src',
});
