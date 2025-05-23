<script lang="ts" setup>
import { useUrlSearchParams } from '@vueuse/core'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primevue'
import { computed } from 'vue'

type HashParams = {
  search_tab?: '' | '1' | '2'
  prefix?: ''
}

// Can read `?#a=b` but immediately rewrites and uses `#a=b`
// TODO Wrap useUrlSearchParams to:
// - use `?#`
// - allow empty params like `&prefix`
// - convert: int <-> string, data <-> base64
// - set default values
const params = useUrlSearchParams<HashParams>('hash-params', {
  initialValue: {
    prefix: undefined,
    search_tab: '',
  },
})

// Wrap params with rename and in/out converters.
const prefix = computed({
  get: () => params.prefix != null,
  set: (x) => (params.prefix = x ? '' : undefined),
})
const searchTab = computed({
  get: () => params.search_tab || '',
  set: (x) => (params.search_tab = x || undefined),
})
</script>

<template>
  <div>
    <a href="#">#</a> | <a href="#?search_tab=2">#?search_tab=2</a> |
    <a href="#?prefix">#?prefix</a>
  </div>
  <pre>{{ { prefix, searchTab } }}</pre>
  <div>
    <label><input type="checkbox" v-model="prefix" /> prefix</label>
  </div>
  <Tabs v-model:value="searchTab">
    <TabList>
      <Tab value="">Simple</Tab>
      <Tab value="1">Extended</Tab>
      <Tab value="2">Advanced</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="">Simple search</TabPanel>
      <TabPanel value="1">Extended search</TabPanel>
      <TabPanel value="2">Advanced search</TabPanel>
    </TabPanels>
  </Tabs>
</template>
