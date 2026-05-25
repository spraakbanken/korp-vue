<script setup lang="ts">
import HeaderSection from "@/header/HeaderSection.vue"
import MainSection from "@/MainSection.vue"
import AppFooter from "./AppFooter.vue"
import AppMessages from "./AppMessages.vue"
import useMessageStore from "./store/useMessageStore"
import useInit from "./useInit"
import { useMatomo } from "vue3-matomo"
import currentMode from "./core/corpora/mode"
import AppSplash from "./AppSplash.vue"

const messageStore = useMessageStore()
const matomo = useMatomo()

const { init, initDone } = useInit()

init()
matomo.value?.trackPageView(currentMode)

// Catch and show errors from anywhere in the app
window.addEventListener("unhandledrejection", (event) => {
  matomo.value?.trackEvent("Error", "Unhandled rejection", event.reason)
  messageStore.addMessage("error", event.reason)
})
window.addEventListener("error", (event) => {
  matomo.value?.trackEvent("Error", "Uncaught error", event.message)
  messageStore.addMessage("error", event.message)
})
</script>

<template>
  <template v-if="initDone">
    <HeaderSection />
    <MainSection class="flex-grow-1" />
    <AppFooter />
  </template>
  <AppSplash v-else />
  <AppMessages />
</template>
