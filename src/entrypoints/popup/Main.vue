<script lang="ts" setup>
const tabsData = ["home", "edit", "add"];

const tabIndex = ref(0);

function setTab(index: number) {
  tabIndex.value = index;
}

function isTabActive(index: number) {
  return tabIndex.value === index;
}
</script>

<template>
  <div class="container" style="align-items: center">
    <div class="drawer">
      <div v-if="isTabActive(0)">
        
      </div>
      <div v-if="isTabActive(1)"></div>
      <div v-if="isTabActive(2)"></div>
      <span
        v-for="(value, index) in tabsData"
        class="material-symbols-outlined pa-sm"
        :class="{ active: isTabActive(index) }"
        @click="setTab(index)"
        >{{ value }}</span
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "./style.scss" as *;

.drawer {
  display: flex;
  background-color: $primary;
  width: 70%;
  justify-content: space-between;
  border-radius: 10px;
  cursor: pointer;
}

.active {
  background-color: $primary-darken-60;
  border-radius: 10px;
  color: white;
}
</style>
