<template>
  <div class="q-pa-md column items-center">
    <q-input
      v-model="password"
      label="Password"
      dense
      class="q-my-sm"
      outlined
      color="primary"
    >
      <template v-slot:prepend>
        <q-icon name="lock" />
      </template>
    </q-input>
    <q-btn label="Login" @click="login"></q-btn>
    {{ msg }}
  </div>
</template>

<script lang="ts">
import { MessageType } from 'app/src-bex/communication';
import { post } from './model';

export default {
  name: 'LoginComponent',
  data() {
    return {
      password: '',
      msg: '',
    };
  },
  methods: {
    login() {
      post(this.$q.bex, '/login', { keyTH: this.password }, false)
        .then((token) => {
          this.$q.bex.send(MessageType.CONNECT, token);
        }).catch((status: number) => {
          if (status == 401) {
            this.msg = 'Wrong password';
          } else {
            this.msg = 'Internal server error';
          }
          setInterval(() => {
            this.msg = '';
          }, 3000);
        });
    },
  },
};
</script>
