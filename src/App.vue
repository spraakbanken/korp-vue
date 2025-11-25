<script setup lang="ts">
import HeaderSection from "@/header/HeaderSection.vue"
import MainSection from "@/MainSection.vue"
import { useExpose } from "@/useExpose"
import { setCorpusListing } from "./core/corpora/corpusListing"
import { CorpusSet } from "./core/corpora/CorpusSet"
import settings from "./core/config"
import { useAuth } from "./auth/useAuth"
import { ref } from "vue"
import { getInstanceConfig } from "./core/config/instanceConfig"
import { loadCorpusConfig } from "./core/config/corpusConfig"
import { setLang } from "./core/i18n"
import { useDark } from "@vueuse/core"
import { useUrlParams } from "./useUrlParams"

useDark({ attribute: "data-bs-theme" })
const auth = useAuth()
useExpose()

const initDone = ref(false)

async function init() {
  // Load instance settings (typically config.yml)
  const instanceConfig = getInstanceConfig()
  setLang(instanceConfig["default_language"])

  // Initialize authentication
  await auth.init(instanceConfig)

  // Fetch config and info
  // TODO Remove hack: Add url to global settings to make korpRequest work
  settings.korp_backend_url = instanceConfig.korp_backend_url
  const corpusConfig = await loadCorpusConfig(instanceConfig)

  // Merge into global settings
  Object.assign(settings, instanceConfig, corpusConfig)

  // Create global corpusListing and corpusSelection
  const corpora = Object.values(settings.corpora)
  setCorpusListing(new CorpusSet(corpora))

  // Connect URL params after settings are loaded
  useUrlParams()

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
