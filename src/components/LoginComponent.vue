<template>
  <div class="q-pa-md column items-center">
    <q-input
      v-model="password"
      label="Password"
      type="password"
      dense
      class="q-my-sm"
      autofocus
      outlined
      @keyup.enter="login"
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
      const pw = this.password;
      this.password = '';
      post(this.$q.bex, '/login', { keyTH: pw }, false)
        .then((token) => {
          this.$q.bex.send('Connect', token);
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
