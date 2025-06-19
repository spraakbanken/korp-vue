<script setup lang="ts">
import { useSearchStore } from '@/stores/search'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const searchStore = useSearchStore()
const { cqp, freeOrder, prefix } = storeToRefs(searchStore)

const input = ref(parseQuery())
const freeOrderLocal = ref(freeOrder.value)
const prefixLocal = ref(prefix.value)

function parseQuery() {
  return 'TODO fix parsing'
}

function buildQuery() {
  const inputClean = input.value.trim()
  if (!inputClean) return '[]'
  return inputClean.split(/\s+/).map(buildToken).join(' ')
}

function buildToken(word: string) {
  return `[word = "${word}${prefix.value ? '.*' : ''}"]`
}

function submit() {
  freeOrder.value = freeOrderLocal.value
  prefix.value = prefixLocal.value
  cqp.value = buildQuery()
}
</script>

<template>
  <div>
    <label>Word(s): <input v-model="input" /></label>
    <input type="submit" @click="submit" value="Search" />
  </div>
  <div>
    <label><input type="checkbox" v-model="freeOrderLocal" /> free order</label>
    <label><input type="checkbox" v-model="prefixLocal" /> prefix</label>
  </div>
  <pre>{{ cqp }}</pre>
</template>
