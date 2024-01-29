<template>
  <div>
    <q-input v-model="url" label="URL" outlined color="primary">
      <template v-slot:prepend>
        <q-icon name="event" />
      </template>
    </q-input>
    <q-input
      v-model="cryptKey"
      color="primary"
      label="Token du serveur"
    ></q-input>
    <q-btn label="Valider" @click="validate"></q-btn>
  </div>
</template>

<script lang="ts">
import { api as axios } from 'src/boot/axios';
import { encrypt } from './model';
import { MessageType } from 'app/src-bex/communication';

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
      axios
        .post(this.url + '/setup', {
          message: testMsg,
          hash: encrypt(testMsg, this.cryptKey),
        })
        .then((out) => {
          if (out.data) {
            this.$q.bex.send(MessageType.CORRECT_SETUP, {
              url: this.url,
              cryptKey: this.cryptKey,
            });
          }
        });
    },
  },
};
</script>
