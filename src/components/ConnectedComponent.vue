<template>
    <div class="q-pa-md column items-center">
      
    </div>
  </template>
  
  <script lang="ts">
  import { api as axios } from 'src/boot/axios';
  import { MessageType, Status } from 'app/src-bex/communication';
  import { AxiosError } from 'axios';
  
  export default {
    name: 'LoginComponent',
    data() {
      return {
        password: '',
        msg: '',
      };
    },
    methods: {
      
    },
  };
  </script>
  