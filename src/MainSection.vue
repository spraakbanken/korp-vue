<script setup lang="ts">
import FrontPage from "./frontpage/FrontPage.vue"
import ResultsPanel from "./results/ResultsPanel.vue"
import { useDynamicTabs } from "./results/useDynamicTabs"
import { useAppStore } from "./store/useAppStore"

const store = useAppStore()
const { dynamicTabs } = useDynamicTabs()
</script>

<template>
  <main class="container-fluid my-3">
    <section v-if="store.activeSearch || dynamicTabs.length">
      <ResultsPanel />
    </section>

    <FrontPage v-else />
  </main>
</template>
