<script lang="ts" setup>

const password = ref('');
const shake = ref(false);
const loading = ref(false);
function login() {
    let pw = password.value;
    password.value = '';
    loading.value = true;
    sendMessage('login', pw).then((resp) => {
        shake.value = !resp;
        loading.value = false;
        setTimeout(() => {
            shake.value = false;
        }, 1500);
    })
}



</script>

<template>
   <div class="container">
    <input type="password" v-model="password" class="my-sm" @keyup.enter="login" placeholder="Password" cur/>
    <button @click="login" :class="{ shake: shake}" class="my-md">
        <div class="loader" v-if="loading"></div>
        <span v-else>Login</span>
    </button>
   </div>
</template>

<style lang="scss">
button {
    display: flex;
    justify-content: center;
    align-items: center;
}
/* HTML: <div class="loader"></div> */
.loader {
  width: 60px;
  aspect-ratio: 6;
  --_g: no-repeat radial-gradient(circle closest-side,#fff 90%,#0000);
  background: 
    var(--_g) 0%   50%,
    var(--_g) 50%  50%,
    var(--_g) 100% 50%;
  background-size: calc(100%/3) 100%;
  animation: l7 1s infinite linear;
}
@keyframes l7 {
    33%{background-size:calc(100%/3) 0%  ,calc(100%/3) 100%,calc(100%/3) 100%}
    50%{background-size:calc(100%/3) 100%,calc(100%/3) 0%  ,calc(100%/3) 100%}
    66%{background-size:calc(100%/3) 100%,calc(100%/3) 100%,calc(100%/3) 0%  }
}
</style>