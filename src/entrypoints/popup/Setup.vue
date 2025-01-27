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
    <div class="">
        <h1>Setup</h1>
        <input type="text" v-model="url" placeholder="URL">
        <input type="text" v-model="token" placeholder="Token">
        <button @click="setup">Test setup</button>
        {{ message }}
    </div>    
</template>

<style lang="css" scoped>

</style>