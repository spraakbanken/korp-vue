<script setup lang="ts">
import HeaderSection from '@/HeaderSection.vue'
import MainSection from '@/MainSection.vue'
import SearchSection from '@/SearchSection.vue'
import { useExpose } from '@/useExpose'
import { computedAsync } from '@vueuse/core'
import { loadSettings } from './core/config/init'
import { setCorpusListing } from './core/corpora/corpusListing'
import { CorpusSet } from './core/corpora/CorpusSet'
import settings from './core/config'

useExpose()

const initDone = computedAsync(async () => {
  // Fetch remote mode/corpus config and merge with local app settings
  await loadSettings()

  // Create global corpusListing and corpusSelection
  const corpora = Object.values(settings.corpora)
  setCorpusListing(new CorpusSet(corpora))

  // Initialization done
  return true
})
</script>

<template>
  <template v-if="initDone">
    <HeaderSection />
    <SearchSection />
    <MainSection />
  </template>
  <div v-else>Loading...</div>
</template>
