<script lang="ts" setup>
import { useUrlSearchParams } from '@vueuse/core'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primevue'

type HashParams = {
  search_tab: 0 | 1 | 2
}

// Can read `?#a=b` but immediately rewrites and uses `#a=b`
// TODO Wrap useUrlSearchParams to:
// - use `?#`
// - allow empty params like `&prefix`
// - convert: int <-> string, data <-> base64
// - set default values
const params = useUrlSearchParams<HashParams>('hash-params', {
  initialValue: {
    search_tab: 0,
  },
  removeFalsyValues: true,
})
</script>

<template>
  {{ typeof params.search_tab }}
  <Tabs v-model:value="params.search_tab">
    <TabList>
      <Tab :value="0">Simple</Tab>
      <Tab :value="1">Extended</Tab>
      <Tab :value="2">Advanced</Tab>
    </TabList>
    <TabPanels>
      <TabPanel :value="0">
        <p>Simple search</p>
      </TabPanel>
      <TabPanel :value="1">
        <p>Extended search</p>
      </TabPanel>
      <TabPanel :value="2">
        <p>Advanced search</p>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
