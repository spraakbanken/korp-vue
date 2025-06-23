<script setup lang="ts">
import { useSearchStore } from '@/stores/search'
import { storeToRefs } from 'pinia'
import { Button, Checkbox, InputText } from 'primevue'
import { ref, watchEffect } from 'vue'

const searchStore = useSearchStore()
const { cqp, freeOrder, prefix } = storeToRefs(searchStore)

const input = ref(parseQuery())
const freeOrderLocal = ref(freeOrder.value)
const prefixLocal = ref(prefix.value)
const cqpLocal = ref(cqp.value)

watchEffect(() => {
  cqpLocal.value = buildQuery()
})

function parseQuery() {
  return 'TODO fix parsing'
}

function buildQuery() {
  const inputClean = input.value.trim()
  if (!inputClean) return '[]'
  return inputClean.split(/\s+/).map(buildToken).join(' ')
}

function buildToken(word: string) {
  return `[word = "${word}${prefixLocal.value ? '.*' : ''}"]`
}

function submit() {
  freeOrder.value = freeOrderLocal.value
  prefix.value = prefixLocal.value
  cqp.value = buildQuery()
}
</script>

<template>
  <form @submit.prevent="submit()">
    <label>Word(s): <InputText v-model="input" /></label>
    <Button type="submit" label="Search" />
  </form>
  <div class="flex flex-wrap gap-4">
    <label><Checkbox binary v-model="freeOrderLocal" /> free order</label>
    <label><Checkbox binary v-model="prefixLocal" /> prefix</label>
  </div>
  <pre class="my-2 p-2 bg-surface-200">{{ cqpLocal }}</pre>
</template>
