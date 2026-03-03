<script setup lang="ts">
import { watch } from "vue"
import FrontPage from "./frontpage/FrontPage.vue"
import ResultsPanel from "./results/ResultsPanel.vue"
import { useDynamicTabs } from "./results/useDynamicTabs"
import { useAppStore } from "./store/useAppStore"
import { storeToRefs } from "pinia"

const store = useAppStore()
const { dynamicTabs } = useDynamicTabs()
const { activeSearch, search } = storeToRefs(store)

watch(search, () => {
  if (!search.value) activeSearch.value = undefined
})
</script>

<template>
  <main class="container-fluid my-3">
    <section v-if="activeSearch || dynamicTabs.length">
      <ResultsPanel />
    </section>

    <FrontPage v-else />
  </main>
</template>
