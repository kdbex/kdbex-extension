import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ['storage', 'activeTab', 'tabs'],
    web_accessible_resources: [
      {
        "resources": ["icon/*"],
        "matches": ["*://*/*"]
      }
    ],
  },
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-vue'],
  srcDir: 'src',
});
