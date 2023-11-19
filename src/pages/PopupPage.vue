<template>
  <SetupComponent v-if="setup()" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MessageType, Status } from '../../src-bex/communication';
import SetupComponent from 'components/SetupComponent.vue';

export default defineComponent({
  name: 'PopupPage',
  components: {
    SetupComponent,
  },
  data() {
    return {
      status: Status.SETUP as Status,
    };
  },
  mounted() {
    this.$q.bex.send(MessageType.GET_STATUS).then((res) => {
      this.status = res.data;
    });
    this.$q.bex.on(MessageType.UPDATE_STATUS, ({ data, respond }) => {
      this.status = data;
      respond();
    });
  },
  methods: {
    setup() {
      return this.status === Status.SETUP;
    },
  },
});
</script>
