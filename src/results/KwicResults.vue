<script setup lang="ts">
import { KwicProxy } from "@/core/api/proxy/KwicProxy"
import type { ApiKwic } from "@/core/api/types"
import { useAppStore } from "@/store/useAppStore"
import { watchImmediate } from "@vueuse/core"
import { storeToRefs } from "pinia"
import { ref } from "vue"

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
  doSearch()
}
async function doSearch() {
  const response = await proxy.makeRequest(cqp.value)
  kwic.value = response.kwic
}
</script>

<template>
  {{ kwic[0] }}
</template>
