<script lang="ts" setup>
import { sendMessage } from '@/utils/messaging';

const url = ref('')
const token = ref('')
const message = ref('')

function setup() {
    sendMessage('testSetup', { url: url.value, token: token.value })
        .then((response) => response).then((response) => {
            if(response) {
                message.value = 'Setup successful'
                sendMessage('validateSetup', { url: url.value, token: token.value })
            } else {
                message.value = 'Setup failed'
            }
        })
}

</script>

<template>
    <div class="container">
        <h3>Setup</h3>
        <input type="text" v-model="url" placeholder="URL" class="my-sm pa-xs">
        <input type="text" v-model="token" placeholder="Token" class="my-sm pa-xs">
        <button @click="setup" class="my-sm">Test setup</button>
        {{ message }}   
    </div>
</template>

<style lang="css" scoped>
</style>