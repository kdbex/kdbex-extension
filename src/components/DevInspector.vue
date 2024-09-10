<template>
  <div class="q-pa-md row items-center">
    {{ tabFields }}
    <q-input v-model="input" />
    <q-btn label="Check input" @click="checkInput()" />
    <q-btn label="Check button" @click="checkButton()" />
    <q-scroll-area style="height: 200px; max-width: 300px;">
      <div>
        {{ data }}
      </div>
    </q-scroll-area>
  </div>
</template>

<script lang="ts">
import { tabsSend } from 'app/src-bex/bridge';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DevInspector',
  data() {
    return {
      input: '',
      data: '',
      tabFields: '',
    };
  },
  mounted() {
    tabsSend('GetFields').then((s) => {
      this.tabFields = `Button : ${s[0]}, fields: ${s[1]}`;
    });
  },
  methods: {
    checkInput() {
      tabsSend('InputCheck', this.input).then((s) => {
        this.data = s;
      });
    },
    checkButton() {
      tabsSend('ButtonCheck', this.input).then((s) => {
        this.data = s;
      });
    },
  },
});
</script>
