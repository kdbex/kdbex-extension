<template>
  <div class="q-pa-md column items-center">
    <q-input v-model="url" label="URL" class="q-my-sm" outlined color="primary">
      <template v-slot:prepend>
        <q-icon name="link" />
      </template>
    </q-input>
    <q-input
      v-model="cryptKey"
      color="primary"
      class="q-my-sm"
      outlined
      label="Token"
    >
      <template v-slot:prepend>
        <q-icon name="key" />
      </template>
    </q-input>

    <q-btn label="Finish Setup" @click="validate"></q-btn>
  </div>
</template>

<script lang="ts">
import { encrypt, post } from './model';

export default {
  name: 'SetupComponent',
  data() {
    return {
      url: '',
      cryptKey: '',
    };
  },
  methods: {
    validate() {
      var characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let testMsg = '';
      for (let i = 0; i < 20; i++) {
        testMsg += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      post(this.$q.bex, this.url + '/setup', {
          message: testMsg,
          hash: encrypt(testMsg, this.cryptKey),

        }, false)
        .then((out) => {
          if (out === 'true') {
            this.$q.bex.send('Setup', {
              url: this.url,
              cryptKey: this.cryptKey,
            });
          } else {
            //TODO
          }
        });
    },
  },
};
</script>
