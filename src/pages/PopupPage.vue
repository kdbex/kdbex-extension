<template>
  <SetupComponent v-if="setup()" />
  <LoginComponent v-if="login()" />
  <ConnectedComponent v-if="connected()" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Status } from '../../src-bex/bridge';
import SetupComponent from 'components/SetupComponent.vue';
import LoginComponent from 'components/LoginComponent.vue';
import ConnectedComponent from 'src/components/ConnectedComponent.vue';

export default defineComponent({
  name: 'PopupPage',
  components: {
    SetupComponent,
    LoginComponent,
    ConnectedComponent
},
  data() {
    return {
      status: Status.SETUP as Status,
    };
  },
  mounted() {
    this.$q.bex.send('GetStatus').then((res) => {
      this.status = res.data;
    })
    this.$q.bex.on('UpdateStatus', ({ data }) => {
      this.status = data;
    });
  },
  methods: {
    setup() {
      return this.status === Status.SETUP;
    },
    login() {
      return this.status === Status.LOGIN;
    },
    connected() {
      return this.status === Status.CONNECTED;
    },
  },
});
</script>
