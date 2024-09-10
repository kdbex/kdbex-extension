<template>
  <dev-inspector v-if="dev()"/>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DevInspector from './components/DevInspector.vue';

export default defineComponent({
  name: 'App',
  components: {
    DevInspector
  },
  methods: {
    dev() {
      return false;
      //return process.env.DEV;
    }
  }
});
</script>
