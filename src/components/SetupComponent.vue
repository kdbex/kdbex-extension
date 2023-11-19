<template>
  <div>
    <q-input v-model="url" label="URL" outlined color="primary">
      <template v-slot:prepend>
        <q-icon name="event" />
      </template>
    </q-input>
    <q-input v-model="token" label="Token du serveur"></q-input>
    <q-btn label="Valider" @click="validate"></q-btn>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { encrypt } from './model';

export default {
  name: 'SetupComponent',
  data() {
    return {
      url: '',
      token: '',
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
          hash: encrypt(testMsg, this.token),
        })
        .then((res) => {
          console.log(res);
        });
      /*this.$q.bex.setup(this.url, this.token).then(() => {
        this.$q.bex.send('test', 'hello').then((res) => {
          console.log(res);
        });
      });*/
    },
  },
};
</script>
