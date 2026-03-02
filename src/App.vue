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
import { getTimeData } from "./core/backend/timedata"
import AppMessages from "./AppMessages.vue"
import useMessageStore from "./store/useMessageStore"

const auth = useAuth()
const messageStore = useMessageStore()
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

  // Load corpus time data in the background
  getTimeData()
}, null)

// Catch and show errors from anywhere in the app
window.addEventListener("unhandledrejection", (event) => {
  messageStore.addMessage("error", event.reason)
})
window.addEventListener("error", (event) => {
  messageStore.addMessage("error", event.message)
})
</script>

<template>
  <template v-if="isReady">
    <HeaderSection />
    <MainSection class="flex-grow-1" />
    <AppFooter />
  </template>
  <div v-else>Loading...</div>
  <AppMessages />
</template>
