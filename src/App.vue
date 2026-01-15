<script setup lang="ts">
import HeaderSection from "@/header/HeaderSection.vue"
import MainSection from "@/MainSection.vue"
import { useExpose } from "@/useExpose"
import { setCorpusListing } from "./core/corpora/corpusListing"
import { CorpusSet } from "./core/corpora/CorpusSet"
import settings from "./core/config"
import { useAuth } from "./auth/useAuth"
import { ref } from "vue"
import { loadCorpusConfig } from "./core/config/corpusConfig"
import { useUrlParams } from "./useUrlParams"

const auth = useAuth()
useExpose()
useUrlParams()

const initDone = ref(false)

async function init() {
  // Initialize authentication
  await auth.init(settings)

  // Fetch config and info
  const corpusConfig = await loadCorpusConfig(settings)

  // Merge into global settings
  Object.assign(settings, corpusConfig)

  // Create global corpusListing and corpusSelection
  const corpora = Object.values(settings.corpora)
  setCorpusListing(new CorpusSet(corpora))

  initDone.value = true
}

init()
</script>

<template>
  <template v-if="initDone">
    <HeaderSection />
    <MainSection />
  </template>
  <div v-else>Loading...</div>
</template>
