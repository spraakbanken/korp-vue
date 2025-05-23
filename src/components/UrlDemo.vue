<script lang="ts" setup>
import { useUrlSearchParams } from '@vueuse/core'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primevue'
import { computed } from 'vue'

type HashParams = {
  cqp?: string
  in_order?: 'false'
  prefix?: ''
  search_tab?: '' | '1' | '2'
}

// Can read `?#a=b` but immediately rewrites and uses `#a=b`
const params = useUrlSearchParams<HashParams>('hash-params')

// Wrap params with rename, in/out converters and default values.
// cqp has a default value
const cqp = computed({
  get: () => params.cqp || '[]',
  set: (x) => (params.cqp = x != '[]' ? x : undefined),
})
// freeOrder is renamed and converted
const freeOrder = computed({
  get: () => params.in_order == 'false',
  set: (x) => (params.in_order = x ? 'false' : undefined),
})
// prefix is boolean
// TODO Can we make it write `prefix` instead of `prefix=`?
const prefix = computed({
  get: () => params.prefix != null,
  set: (x) => (params.prefix = x ? '' : undefined),
})
// searchTab has a default falsy value
const searchTab = computed({
  get: () => params.search_tab || '',
  set: (x) => (params.search_tab = x || undefined),
})
</script>

<template>
  <pre>{{ { cqp, freeOrder, prefix, searchTab } }}</pre>

  <div style="display: flex; flex-wrap: wrap; gap: 1em">
    <label>cqp <input v-model="cqp" /></label>
    <label><input type="checkbox" v-model="freeOrder" /> free order</label>
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
