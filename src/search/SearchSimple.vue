<script setup lang="ts">
import { ref } from "vue"
import { useAppStore } from "@/store/useAppStore"
import { splitFirst } from "@/core/util"
import { storeToRefs } from "pinia"
import { watchImmediate } from "@vueuse/core"
import type { CqpQuery } from "@/core/cqp/cqp.types"
import { stringify } from "@/core/cqp/cqp"

const store = useAppStore()
const { search } = storeToRefs(store)

const input = ref("")

watchImmediate(search, () => {
  // For simple, `search` has the format `{word,lemgram}|<value>`
  const [type, val] = splitFirst("|", store.search || "")
  if (type != "word" && type != "lemgram") return
  input.value = val

  // Trigger search
  doSearch()
})

function submit() {
  store.search = `word|${input.value}`
  doSearch()
}

function doSearch() {
  store.activeSearch = { type: "word", cqp: createCqp() }
}

function createCqp() {
  const query: CqpQuery = [{ and_block: [[{ type: "word", op: "=", val: input.value }]] }]
  return stringify(query)
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="input" />
    <input type="submit" :value="$t('search')" />
  </form>
</template>
