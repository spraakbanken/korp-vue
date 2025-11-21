<script setup lang="ts">
import { KwicProxy } from "@/core/api/proxy/KwicProxy"
import type { ApiKwic } from "@/core/api/types"
import { corpusSelection } from "@/core/corpora/corpusListing"
import { useAppStore } from "@/store/useAppStore"
import { watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { ref } from "vue"
import KwicGrid from "./kwic/KwicGrid.vue"
import { massageData } from "@/core/kwic/kwic"

const store = useAppStore()

const { activeSearch } = storeToRefs(store)
const cqp = ref("[]")
const kwic = ref<ApiKwic[]>()
const proxy = new KwicProxy(store)

watchImmediate(activeSearch, () => {
  if (!store.activeSearch) return
  cqp.value = store.activeSearch.cqp
  updateSearch()
})

function updateSearch() {
  // Initial corpus selection may not have settled yet.
  if (corpusSelection.corpora.length) doSearch()
  else setTimeout(() => doSearch())
}

async function doSearch() {
  const response = await proxy.makeRequest(cqp.value)
  kwic.value = response.kwic
}
</script>

<template>
  <div>
    <KwicGrid v-if="kwic" :data="massageData(kwic)" />
  </div>
</template>
