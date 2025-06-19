<script setup lang="ts">
import { useSearchStore } from '@/stores/search'
import { storeToRefs } from 'pinia'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primevue'
import SimpleSearch from './SimpleSearch.vue'
import ExtendedSearch from './extended/ExtendedSearch.vue'

const searchStore = useSearchStore()
const { searchTab } = storeToRefs(searchStore)
</script>

<template>
  <Tabs v-model:value="searchTab">
    <TabList>
      <Tab value="">Simple</Tab>
      <Tab value="1">Extended</Tab>
      <Tab value="2">Advanced</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value=""><SimpleSearch></SimpleSearch></TabPanel>
      <TabPanel value="1"><ExtendedSearch></ExtendedSearch></TabPanel>
      <TabPanel value="2">TODO: Advanced search</TabPanel>
    </TabPanels>
  </Tabs>
</template>
