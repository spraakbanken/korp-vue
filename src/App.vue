<script setup lang="ts">
import HeaderSection from "@/page/header/HeaderSection.vue"
import MainSection from "@/page/MainSection.vue"
import AppFooter from "@/page/AppFooter.vue"
import useInit from "@/useInit"
import { useMatomo } from "vue3-matomo"
import currentMode from "@/core/corpora/mode"
import AppSplash from "@/page/AppSplash.vue"

const matomo = useMatomo()

const { init, initDone } = useInit()

init()
matomo.value?.trackPageView(currentMode)

// Catch and show errors from anywhere in the app
window.addEventListener("unhandledrejection", (event) => {
  matomo.value?.trackEvent("Error", "Unhandled rejection", event.reason)
})
window.addEventListener("error", (event) => {
  matomo.value?.trackEvent("Error", "Uncaught error", event.message)
})
</script>

<template>
  <template v-if="initDone">
    <HeaderSection />
    <MainSection class="flex-grow-1" />
    <AppFooter />
  </template>
  <!-- TODO Show splash also in index.html before app is mounted? -->
  <AppSplash v-else />
</template>
