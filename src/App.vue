<script setup lang="ts">
import HeaderSection from "@/header/HeaderSection.vue"
import MainSection from "@/MainSection.vue"
import AppFooter from "./AppFooter.vue"
import AppMessages from "./AppMessages.vue"
import useMessageStore from "./store/useMessageStore"
import useInit from "./useInit"

const messageStore = useMessageStore()

const { init, initDone } = useInit()

init()

// Catch and show errors from anywhere in the app
window.addEventListener("unhandledrejection", (event) => {
  messageStore.addMessage("error", event.reason)
})
window.addEventListener("error", (event) => {
  messageStore.addMessage("error", event.message)
})
</script>

<template>
  <template v-if="initDone">
    <HeaderSection />
    <MainSection class="flex-grow-1" />
    <AppFooter />
  </template>
  <div v-else>Loading...</div>
  <AppMessages />
</template>
