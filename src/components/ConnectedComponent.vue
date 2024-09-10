<template>
  <div v-if="url" class="q-pa-md column items-center">
    <q-select
      dense
      label="Current entry"
      v-model="currentEntry"
      :options="availableEntries"
      @update:model-value="selectEntry"
      :option-label="(item) => item.name"
    />
    <q-expansion-item expand-separator icon="plus" label="Add entry">
      <q-card>
        <q-card-section>
          <div>
            <q-select
              label="Search existing entry"
              dense
              v-model="currentEntry"
              :options="availableEntries"
            />
            <q-btn label="Set this entry's URL" @click="setEntryURL" />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
  <div v-else>No data on this page</div>
</template>

<script lang="ts">
import { KdbexEntry, tabsSend } from 'app/src-bex/bridge';
import { get } from './model';

export default {
  name: 'ConnectedComponent',
  data() {
    return {
      password: '',
      msg: '',
      url: null as string | null,
      currentEntry: undefined as KdbexEntry | undefined,
      availableEntries: [] as KdbexEntry[],
      currentURLEntry: null as KdbexEntry | null,
      urlEntries: [] as KdbexEntry[],
    };
  },
  mounted() {
    this.$q.bex.send('CurrentData').then(({ data }) => {
      if (data) {
        this.url = data[0];
        get(this.$q.bex, `/entries/url/${this.url}/0`).then((entries) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.availableEntries = Object.values(entries as any);
          this.currentEntry = this.availableEntries.find((entry) => {
            return entry.id === data[1];
          });
        });
      }
    });
  },
  methods: {
    setEntryURL() {
      console.log('');
    },
    selectEntry(entry: KdbexEntry | undefined) {
      if (entry) {
        this.$q.bex.send('EntrySelected', entry.id);
        tabsSend('EntrySelected', entry.id);
      }
    },
  },
};
</script>
