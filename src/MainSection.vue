<script setup lang="ts">
import ResultsPanel from "./results/ResultsPanel.vue"
import { useAppStore } from "./store/useAppStore"

const store = useAppStore()
</script>

<template>
  <main class="container">
    <section v-if="store.activeSearch">
      <ResultsPanel />
    </section>
    <section v-else>TODO Frontpage</section>
  </main>
</template>
