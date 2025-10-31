<script setup lang="ts">
import KwicResults from "./results/KwicResults.vue"
import { useAppStore } from "./store/useAppStore"

const store = useAppStore()
</script>

<template>
  <main>
    <section v-if="store.activeSearch">
      <KwicResults />
    </section>
    <section v-else>TODO Frontpage</section>
  </main>
</template>
