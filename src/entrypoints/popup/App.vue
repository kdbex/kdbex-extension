<script lang="ts" setup>
import { Router } from '@/utils/routing';
import LoginVue from './Login.vue'
import SetupVue from './Setup.vue';
import { ref } from 'vue'

const router = ref(Router.Setup)
onMessage('movePopup', data => {
  router.value = data.data
})
sendMessage('getPopup', undefined).then((r) => r).then((r) => {
  router.value = r
})

const showSetup = computed(() => router.value === Router.Setup)
const showLogin = computed(() => router.value === Router.Login)
</script>

<template>  
  <SetupVue v-if="showSetup"/>
  <LoginVue v-if="showLogin"/>
</template>
