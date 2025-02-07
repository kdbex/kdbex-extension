<script lang="ts" setup>

const password = ref('');
const shake = ref(false);
function login() {
    let pw = password.value;
    password.value = '';
    sendMessage('login', pw).then((resp) => {
        shake.value = !resp;
        setTimeout(() => {
            shake.value = false;
        }, 1500);
    })
}



</script>

<template>
   <div class="container">
    <input type="password" v-model="password" class="my-sm" @keyup.enter="login" placeholder="Password" cur/>
    <button @click="login" :class="{ shake: shake}" class="my-md">Login</button>
   </div>
</template>