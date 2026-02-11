<script setup lang="ts">
import HeaderSection from "@/header/HeaderSection.vue"
import MainSection from "@/MainSection.vue"
import { setCorpusListing } from "./core/corpora/corpusListing"
import { CorpusSet } from "./core/corpora/CorpusSet"
import settings from "./core/config"
import { useAuth } from "./auth/useAuth"
import { useAsyncState } from "@vueuse/core"
import { loadCorpusConfig } from "./core/config/corpusConfig"
import { useUrlParams } from "./useUrlParams"
import AppFooter from "./AppFooter.vue"

const auth = useAuth()
useUrlParams()

const { isReady } = useAsyncState(async () => {
  // Initialize authentication
  await auth.init(settings)

  // Fetch config and info
  const corpusConfig = await loadCorpusConfig(settings)

  // Merge into global settings
  Object.assign(settings, corpusConfig)

  // Create global corpusListing and corpusSelection
  const corpora = Object.values(settings.corpora)
  setCorpusListing(new CorpusSet(corpora))
}, null)
</script>

<template>
  <template v-if="isReady">
    <HeaderSection />
    <MainSection />
    <AppFooter class="flex-grow-1" />
  </template>
  <div v-else>Loading...</div>
</template>
