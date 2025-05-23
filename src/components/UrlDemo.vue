<script lang="ts" setup>
import { useSearchStore } from '@/stores/search'
import { storeToRefs } from 'pinia'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primevue'

const searchStore = useSearchStore()
const { cqp, freeOrder, prefix, searchTab } = storeToRefs(searchStore)
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
