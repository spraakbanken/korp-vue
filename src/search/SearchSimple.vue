<script setup lang="ts">
import { ref } from "vue"
import { useAppStore } from "@/store/useAppStore"
import { splitFirst } from "@/core/util"
import { storeToRefs } from "pinia"
import { watchImmediate } from "@vueuse/core"
import type { CqpQuery } from "@/core/cqp/cqp.types"
import { stringify } from "@/core/cqp/cqp"
import { watchEffect } from "vue"

const store = useAppStore()
const { search, prefix, suffix, in_order, isCaseInsensitive } = storeToRefs(store)

const prefixLocal = ref(prefix.value)
const midfixLocal = ref(false)
const suffixLocal = ref(suffix.value)
const freeOrder = ref(!in_order.value)
const ignoreCase = ref(isCaseInsensitive.value)
const input = ref("")

// Sync continually from store to form.
watchEffect(() => (prefixLocal.value = prefix.value))
watchEffect(() => (suffixLocal.value = suffix.value))
watchEffect(() => (midfixLocal.value = prefixLocal.value && suffixLocal.value))
watchEffect(() => (freeOrder.value = !in_order.value))
watchEffect(() => (ignoreCase.value = isCaseInsensitive.value))
watchImmediate(search, () => {
  // For simple, `search` has the format `{word,lemgram}|<value>`
  const [type, val] = splitFirst("|", store.search || "")
  if (type != "word" && type != "lemgram") return
  input.value = val

  // Trigger search
  doSearch()
})

function onMidfixChange() {
  if (midfixLocal.value) {
    prefixLocal.value = true
    suffixLocal.value = true
  }
}

function submit() {
  // Sync from form to store when submitting.
  store.prefix = prefixLocal.value
  store.suffix = suffixLocal.value
  store.in_order = !freeOrder.value
  store.isCaseInsensitive = ignoreCase.value
  store.search = `word|${input.value}`
  doSearch()
}

function doSearch() {
  if (!input.value) return
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
    <label><input type="checkbox" v-model="prefixLocal" />Prefix</label>
    <label><input type="checkbox" v-model="midfixLocal" @change="onMidfixChange()" />Midfix</label>
    <label><input type="checkbox" v-model="suffixLocal" />Suffix</label>
    <label><input type="checkbox" v-model="freeOrder" />Free order</label>
    <label><input type="checkbox" v-model="ignoreCase" />Case-insensitive</label>
    <input type="submit" :value="$t('search')" />
  </form>
</template>
