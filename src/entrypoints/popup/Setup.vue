<script lang="ts" setup>
import { sendMessage } from '@/utils/messaging';

const url = ref('')
const token = ref('')
const message = ref('')

function setup() {
    sendMessage('testSetup', { url: url.value, token: token.value })
        .then((response) => {
            if(response) {
                sendMessage('validateSetup', { url: url.value, token: token.value })
            } else {
                message.value = 'Settings are invalid'
            }
        })
}

</script>

<template>
    <div class="container ma-md">
        <input type="text" v-model="url" placeholder="URL" class="my-sm">
        <input type="text" v-model="token" placeholder="Token" class="my-sm">
        <button @click="setup" class="my-sm">Save settings</button>
        {{ message }}   
    </div>
</template>

<style lang="css" scoped>
</style>