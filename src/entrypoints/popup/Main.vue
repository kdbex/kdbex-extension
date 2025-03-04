<script lang="ts" setup>
import { SharedEntry } from "@/utils/messaging";

const homeTab = ref(true);

function setTab(tab: boolean) {
  homeTab.value = tab;
}

const forms = ref(0);//Number of forms on the page
const url = ref("");//URL of the page
const entries = ref([] as SharedEntry[]);//List of entries one can fill in
const selectedEntry = ref(undefined as string | undefined);

sendMessage("queryTabData", undefined).then((res) => {
  if (res) {
    entries.value = res.entries;
    forms.value = res.forms;
    url.value = res.url; 
    selectedEntry.value = res.selected;
  }
});

const filterInput = ref("");
const nameFilteredEntries = ref([] as SharedEntry[]); 
const selectedFilteredEntry = ref(undefined as string | undefined);

function updateEntryURL() {
  sendMessage('updateEntryURL', selectedFilteredEntry.value!!)
}

function filterEntries() {
  sendMessage('getEntriesByName', filterInput.value).then((res) => {
    nameFilteredEntries.value = res;
  });
}
</script>

<template>
  <div class="container">
    <span>
      <span style="font-weight: bold;">URL:</span>
      {{ url }}
    </span>
    <span>
      <span style="font-weight: bold;">Login forms detected:</span>
      {{ forms }}
    </span>
  </div>
  <hr style="width: 100vw"/>
  <div class="container">
    <span>Selected entry</span>
    <select v-model="selectedEntry">
      <option v-for="entry in entries" :value="entry.id">{{ entry.name }}</option>
    </select>
    <span>Link entry</span>
    <input type="text" v-model="filterInput" @change="filterEntries">
    <select v-model="selectedFilteredEntry">
      <option v-for="entry in nameFilteredEntries" :value="entry.id">{{ entry.name }}</option>
    </select>
    <button @click="updateEntryURL" :disabled="selectedFilteredEntry == undefined">Link entry</button>
  </div>
</template>

<style lang="scss" scoped>
@use "./style.scss" as *;

$border-radius: 25px;

.drawer {
  position: relative;
  background-color: $primary;
  display: flex;
  width: 50%;
  justify-content: space-between;
  border-radius: $border-radius;
  align-items: center;
  cursor: pointer;
}

.bg {
  position: absolute;
  top: 0;
  width: 24px;
  aspect-ratio: 1;
  background-color: $primary-darken-60;
  border-radius: $border-radius;
  z-index: 0;
  transition: left 0.5s, transform 0.5s;
}

.ml {
  left: 0;
  transform: translateX(0);
}

.mr {
  left: 100%;
  transform: translateX(-100%);
}

.icon {
  position: relative;
  z-index: 1;
  border-radius: $border-radius;
}

.active {
  color: white;
}
</style>
