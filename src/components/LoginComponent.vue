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
import { api as axios } from 'src/boot/axios';
import { MessageType, Status } from 'app/src-bex/communication';
import { AxiosError } from 'axios';

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
      axios
        .post('/login', {
          keyTH: this.password,
        })
        .then((res) => res.data)
        .then((token) => {
          this.$q.bex.send(MessageType.UPDATE_TOKEN, token);
          this.$q.bex.send(MessageType.SET_STATUS, Status.CONNECTED);
        })
        .catch((err: AxiosError) => {
          const status = err.response?.status;
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
