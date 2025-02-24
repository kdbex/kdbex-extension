<script lang="ts" setup>
import { SharedEntry } from "@/utils/messaging";
import { KdbexEntry } from "@/utils/model";

const homeTab = ref(true);

function setTab(tab: boolean) {
  homeTab.value = tab;
}

const field = ref(0);
const entries = ref([] as SharedEntry[]);
const selectedEntry = ref(undefined as string | undefined);

sendMessage("queryPopupData", undefined).then((res) => {
  if (res) {
    entries.value = res.entries;
    field.value = res.fields;
    selectedEntry.value = res.selected;  
  } else {
    entries.value = [];
    field.value = 0;
  }
});

const filterInput = ref("");
const nameFilteredEntries = ref([] as SharedEntry[]); 

function filterEntries() {
  console.log(filterInput.value);
}
</script>

<template>
  <div class="container" style="align-items: center">
    <div>
      <div v-if="homeTab">
        <span v-if="field > 0">{{ field }} forms detected on the page</span>
        <span v-else>No forms detected on the page</span>
        <!--select entry-->
        <select v-if="entries.length > 0" v-model="selectedEntry" @select="sendMessage('selectEntry', selectedEntry!!)">
          <option
            v-for="entry in entries"
            :key="entry.id"
            :value="entry.id"
            >{{ entry.name }}</option
          >
        </select>
        <input v-model="filterInput" @change="filterEntries"/>
      </div>
      <div v-if="!homeTab"></div>
    </div>
    <div class="drawer mt-md">
      <div
        class="bg pa-sm"
        :class="{
          ml: homeTab,
          mr: !homeTab,
        }"></div>
      <span
        class="material-symbols-outlined pa-sm icon"
        :class="{ active: homeTab }"
        @click="setTab(true)"
        >home</span
      >
      <span
        class="material-symbols-outlined pa-sm icon"
        :class="{ active: !homeTab }"
        @click="setTab(false)"
        >edit</span
      >
    </div>
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
